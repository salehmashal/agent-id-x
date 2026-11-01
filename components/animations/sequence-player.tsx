"use client";

import {
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { InOneBoard, Pass, Piece } from "@/components/explainers/shared";
import { ShareBar } from "@/components/share-bar";
import { boardFocusClass } from "@/lib/identity-visuals";
import type {
  AnimationHeldToken,
  AnimationStep,
  PacketKind,
  ProtocolAnimation,
} from "@/lib/animations";
import { DEFAULT_DURATION_MS } from "@/lib/animations";
import { parseHopParam, replaceHopQuery, type ShareTarget } from "@/lib/share";
import type { PayloadChip } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Extra hop fields may be absent on older animation objects. */
type PedagogySequence = ProtocolAnimation & {
  protocol?: string;
  question?: string;
  takeaway?: string;
};

type PedagogyStep = AnimationStep & {
  why?: string;
  caption?: string;
  citation?: string;
  chips?: PayloadChip[];
  now?: string;
};

const SPEEDS = [0.5, 1, 2] as const;

const packetPass: Record<
  PacketKind,
  { variant: "sealed" | "bearer" | "dpop" | "opaque" | "identity" | "plain" }
> = {
  request: { variant: "plain" },
  token: { variant: "bearer" },
  "id-token": { variant: "identity" },
  proof: { variant: "dpop" },
  challenge: { variant: "plain" },
  card: { variant: "sealed" },
  consent: { variant: "identity" },
  session: { variant: "opaque" },
  code: { variant: "plain" },
};

function usePrefersReducedMotion(): boolean {
  // Default false so SSR/first paint keeps Play enabled. After mount we
  // sync to the real media query. Reduced motion turns off continuous CSS
  // motion; it must not freeze or disable the stepper.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

const controlBtnClass = cn(
  "inline-flex min-h-8 shrink-0 cursor-pointer touch-manipulation items-center justify-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm text-foreground transition-colors select-none",
  "hover:bg-muted hover:text-foreground",
  boardFocusClass,
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const iconBtnClass = cn(controlBtnClass, "size-8 px-0 py-0");

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function heldThroughStep(
  steps: AnimationStep[],
  stepIndex: number,
  progress: number,
): AnimationHeldToken[] {
  const held: AnimationHeldToken[] = [];
  const seen = new Set<string>();
  const push = (token: AnimationHeldToken) => {
    const key = `${token.actorId}:${token.label}`;
    if (seen.has(key)) return;
    seen.add(key);
    held.push(token);
  };
  for (let i = 0; i < steps.length; i += 1) {
    const appear = steps[i]?.tokensAppear;
    if (!appear) continue;
    if (i < stepIndex || (i === stepIndex && progress >= 0.72)) {
      appear.forEach(push);
    }
  }
  return held;
}

function PacketBadge({ step }: { step: AnimationStep }) {
  const packet = step.packet;
  if (!packet) return null;
  if (packet.kind === "challenge" || step.challenge) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 font-mono text-[11px] text-destructive",
          step.fail && "line-through opacity-80",
        )}
      >
        {packet.label}
      </span>
    );
  }
  return (
    <Pass
      label={packet.label}
      variant={packetPass[packet.kind].variant}
      active={!step.fail}
    />
  );
}

function ChipList({ chips }: { chips: PayloadChip[] }) {
  const hasEg = chips.some((chip) => chip.source === "illustrative");
  const hasSpec = chips.some((chip) => chip.source === "from-spec");
  return (
    <div className="mt-2">
      <ul className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <li key={`${chip.source}:${chip.label}`}>
            <span
              title={
                chip.hint ??
                (chip.source === "from-spec"
                  ? "Noun from the spec"
                  : "Illustrative example — not a verbatim requirement")
              }
              className={cn(
                "inline-flex max-w-full items-center rounded-md px-2 py-0.5 font-mono text-[11px] leading-snug",
                chip.source === "from-spec"
                  ? "border border-border bg-card text-foreground"
                  : "border border-dashed border-muted-foreground/45 bg-muted/60 text-muted-foreground",
              )}
            >
              <span className="min-w-0 break-all">{chip.label}</span>
              <span className="sr-only">
                {chip.source === "from-spec"
                  ? " from the spec"
                  : " illustrative example"}
              </span>
            </span>
          </li>
        ))}
      </ul>
      {hasEg || hasSpec ? (
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {hasSpec ? "Solid = from the spec" : null}
          {hasSpec && hasEg ? " · " : null}
          {hasEg ? "Dashed = illustrative" : null}
        </p>
      ) : null}
    </div>
  );
}

function ActorColumn({
  actorId,
  label,
  kind,
  role,
  challenge,
  tokens,
  register,
}: {
  actorId: string;
  label: string;
  kind: ProtocolAnimation["actors"][number]["kind"];
  role: "from" | "to" | "both" | null;
  challenge: boolean;
  tokens: AnimationHeldToken[];
  register: (id: string, node: HTMLElement | null) => void;
}) {
  const active = role !== null;
  return (
    <div
      ref={(node) => register(actorId, node)}
      className={cn(
        "flex min-w-0 flex-1 flex-col items-start gap-1 md:items-center md:text-center",
        challenge && "sequence-challenge rounded-lg p-1",
        role === "from" && "rounded-lg ring-2 ring-primary/35",
        role === "to" && "rounded-lg ring-2 ring-grant/40",
        role === "both" && "rounded-lg ring-2 ring-primary/35",
      )}
    >
      <div className="flex min-w-0 items-center gap-2 md:flex-col md:items-center">
        <Piece kind={kind} label={label} size="sm" active={active} />
        {role ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
            {role === "from" ? "sends" : role === "to" ? "gets" : "same party"}
          </span>
        ) : null}
      </div>
      {tokens.length > 0 ? (
        <div className="flex flex-wrap gap-1 md:justify-center">
          {tokens.map((token) => (
            <Pass
              key={`${token.actorId}-${token.label}`}
              label={token.label}
              variant={packetPass[token.packet].variant}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function actorRole(
  actorId: string,
  from: string,
  to: string,
): "from" | "to" | "both" | null {
  const isFrom = actorId === from;
  const isTo = actorId === to;
  if (isFrom && isTo) return "both";
  if (isFrom) return "from";
  if (isTo) return "to";
  return null;
}

type Phase = { name: string; start: number; count: number };

function phasesOf(steps: PedagogyStep[]): Phase[] {
  const list: Phase[] = [];
  for (let i = 0; i < steps.length; i += 1) {
    const name = steps[i]?.chapter?.trim() || "Hop";
    const last = list[list.length - 1];
    if (last && last.name === name) {
      last.count += 1;
    } else {
      list.push({ name, start: i, count: 1 });
    }
  }
  return list;
}

function YouAreHere({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm bg-brass/15 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-brass",
        className,
      )}
    >
      You are here
    </span>
  );
}

export function SequencePlayer({
  sequence,
  autoPlay = true,
  footer,
  share,
  onHopChange,
}: {
  sequence: PedagogySequence;
  autoPlay?: boolean;
  footer?: ReactNode;
  share?: ShareTarget | null;
  /** 0-based hop index after each seek or autoplay advance. */
  onHopChange?: (hopIndex: number) => void;
}) {
  const reduced = usePrefersReducedMotion();
  const steps = sequence.steps as PedagogyStep[];
  const stepCount = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  // Stay paused until the hop query is applied so autoplay cannot race a seek.
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [progress, setProgress] = useState(0);

  const stageRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const actorNodes = useRef(new Map<string, HTMLElement>());
  const stepIndexRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(speed);
  const progressRef = useRef(0);
  const reducedRef = useRef(reduced);
  const dwellRef = useRef(0);

  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    onHopChange?.(stepIndex);
  }, [onHopChange, stepIndex]);

  useEffect(() => {
    const index = parseHopParam(
      new URLSearchParams(window.location.search).get("hop"),
      stepCount,
    );
    if (index != null) {
      stepIndexRef.current = index;
      setStepIndex(index);
      dwellRef.current = 0;
      const p = reducedRef.current ? 1 : 0;
      progressRef.current = p;
      setProgress(p);
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (autoPlay) {
      playingRef.current = true;
      setPlaying(true);
    }
  }, [autoPlay, stepCount]);

  const registerActor = useCallback((id: string, node: HTMLElement | null) => {
    if (node) actorNodes.current.set(id, node);
    else actorNodes.current.delete(id);
  }, []);

  const placePacket = useCallback((t: number, step: AnimationStep) => {
    const packet = packetRef.current;
    const stage = stageRef.current;
    if (!packet || !stage) return;
    const fromEl = actorNodes.current.get(step.from);
    const toEl = actorNodes.current.get(step.to);
    if (!fromEl || !toEl) {
      packet.style.opacity = "0";
      return;
    }
    const sr = stage.getBoundingClientRect();
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();
    const fx = fr.left + fr.width / 2 - sr.left;
    const fy = fr.top + fr.height / 2 - sr.top;
    const tx = tr.left + tr.width / 2 - sr.left;
    const ty = tr.top + tr.height / 2 - sr.top;
    const flyT = Math.min(1, t / 0.72);
    const arc = sr.width < 420 ? 12 : 28;
    const x = lerp(fx, tx, flyT);
    const y = lerp(fy, ty, flyT) + (t < 1 ? Math.sin(flyT * Math.PI) * arc : 0);
    packet.style.opacity = "1";
    packet.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const advance = () => {
      const lastStep = stepIndexRef.current >= steps.length - 1;
      if (lastStep && sequence.loop !== false) {
        stepIndexRef.current = 0;
        setStepIndex(0);
        dwellRef.current = 0;
        return reducedRef.current ? 1 : 0;
      }
      if (lastStep) {
        playingRef.current = false;
        setPlaying(false);
        dwellRef.current = 0;
        return 1;
      }
      const upcoming = stepIndexRef.current + 1;
      stepIndexRef.current = upcoming;
      setStepIndex(upcoming);
      dwellRef.current = 0;
      return reducedRef.current ? 1 : 0;
    };
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const step = steps[stepIndexRef.current];
      if (step) {
        if (reducedRef.current) {
          if (progressRef.current !== 1) {
            progressRef.current = 1;
            setProgress(1);
          } else {
            progressRef.current = 1;
          }
          placePacket(1, step);
          if (playingRef.current) {
            const duration =
              (step.durationMs ?? DEFAULT_DURATION_MS) / speedRef.current;
            dwellRef.current += dt;
            if (dwellRef.current >= duration) {
              const next = advance();
              progressRef.current = next;
              setProgress(next);
              placePacket(next, steps[stepIndexRef.current] ?? step);
            }
          }
        } else if (playingRef.current) {
          const duration =
            (step.durationMs ?? DEFAULT_DURATION_MS) / speedRef.current;
          let next = progressRef.current + dt / duration;
          if (next >= 1) {
            next = advance();
          }
          const crossed =
            (progressRef.current < 0.72 && next >= 0.72) ||
            next < progressRef.current ||
            next === 0 ||
            next === 1;
          progressRef.current = next;
          if (crossed) setProgress(next);
          placePacket(next, steps[stepIndexRef.current] ?? step);
        } else {
          placePacket(progressRef.current, step);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [placePacket, sequence.loop, steps]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const step = steps[stepIndexRef.current];
      if (step) placePacket(progressRef.current, step);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, [placePacket, steps]);

  const step = steps[stepIndex] ?? steps[0];
  const held = useMemo(
    () => heldThroughStep(steps, stepIndex, progress),
    [steps, stepIndex, progress],
  );
  const actorsById = useMemo(() => {
    const map = new Map(sequence.actors.map((item) => [item.id, item]));
    return map;
  }, [sequence.actors]);
  const fromActor = step ? actorsById.get(step.from) : undefined;
  const toActor = step ? actorsById.get(step.to) : undefined;
  const onLastStep = stepIndex >= stepCount - 1;
  const heading =
    sequence.protocol && sequence.question
      ? `${sequence.protocol} — ${sequence.question}`
      : sequence.title;
  const phases = useMemo(() => phasesOf(steps), [steps]);
  const currentPhase =
    phases.find(
      (phase) =>
        stepIndex >= phase.start && stepIndex < phase.start + phase.count,
    ) ?? phases[0];

  function goTo(index: number, startPlaying = false) {
    const next = Math.max(0, Math.min(stepCount - 1, index));
    stepIndexRef.current = next;
    setStepIndex(next);
    dwellRef.current = 0;
    const p = reduced ? 1 : 0;
    progressRef.current = p;
    setProgress(p);
    playingRef.current = startPlaying;
    setPlaying(startPlaying);
    if (share?.path) replaceHopQuery(next + 1);
  }

  function togglePlay() {
    if (playing) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (stepIndex >= stepCount - 1 && sequence.loop === false) {
      goTo(0, true);
      return;
    }
    playingRef.current = true;
    setPlaying(true);
  }

  function onPlayerKey(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, [contenteditable='true']")) {
      return;
    }
    const key = event.key;
    if (key === "ArrowRight" || key === "j" || key === "J") {
      event.preventDefault();
      goTo(stepIndex + 1);
      return;
    }
    if (key === "ArrowLeft" || key === "k" || key === "K") {
      event.preventDefault();
      goTo(stepIndex - 1);
      return;
    }
    if (key === "Home") {
      event.preventDefault();
      goTo(0);
      return;
    }
    if (key === "End") {
      event.preventDefault();
      goTo(stepCount - 1);
      return;
    }
    if (key === " " || key === "Spacebar") {
      if (target?.closest("button, a, [role='tab']")) return;
      event.preventDefault();
      togglePlay();
    }
  }

  if (!step) return null;

  return (
    <InOneBoard
      kicker={sequence.kicker}
      title={heading}
      footnote={sequence.footnote}
    >
      <div
        className={cn(
          "relative z-10 isolate rounded-lg bg-card",
          boardFocusClass,
        )}
        tabIndex={0}
        onKeyDown={onPlayerKey}
        aria-label="Sequence player. Arrow keys or J K to step, space to play or pause, Home and End to jump."
      >
        {sequence.protocol && sequence.question ? (
          <p className="-mt-2 mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-brass">
            {sequence.title}
          </p>
        ) : null}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sequence.summary}
        </p>
        {reduced ? (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-brass">
            Stepped mode — continuous motion is off (prefers-reduced-motion)
          </p>
        ) : null}

        {phases.length > 0 ? (
          <div
            role="tablist"
            aria-label="Sequence phases"
            className="mt-4 flex flex-wrap gap-1.5"
          >
            {phases.map((phase) => {
              const on = currentPhase?.name === phase.name;
              return (
                <button
                  key={`${phase.name}-${phase.start}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  title={`Jump to ${phase.name} (hop ${phase.start + 1})`}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-colors",
                    boardFocusClass,
                    on
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/45 hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => goTo(phase.start)}
                >
                  <span className="font-heading text-sm">{phase.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {phase.count === 1 ? "1 hop" : `${phase.count} hops`}
                  </span>
                  {on ? <YouAreHere /> : null}
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(15.5rem,0.9fr)]">
          <div className="sequence-stage relative z-0 isolate min-w-0 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
            <div
              ref={stageRef}
              className="relative overflow-x-auto px-3 pb-5 pt-10 md:px-4"
            >
              <div className="flex flex-col gap-4 md:min-w-[44rem] md:flex-row md:items-start md:justify-between md:gap-2 lg:min-w-0">
                {sequence.actors.map((item) => (
                  <ActorColumn
                    key={item.id}
                    actorId={item.id}
                    label={item.label}
                    kind={item.kind}
                    role={actorRole(item.id, step.from, step.to)}
                    challenge={Boolean(step.challenge && item.id === step.to)}
                    tokens={held.filter((token) => token.actorId === item.id)}
                    register={registerActor}
                  />
                ))}
              </div>
              <div
                ref={packetRef}
                className="sequence-packet pointer-events-none absolute left-0 top-0 z-10"
                style={{ opacity: 0 }}
                aria-hidden
              >
                <PacketBadge step={step} />
              </div>
            </div>
          </div>

          <nav
            aria-label="Hop list"
            className="max-h-[min(22rem,60vh)] overflow-y-auto rounded-lg border border-border bg-muted/20 p-2 lg:max-h-[min(28rem,calc(100vh-12rem))] lg:sticky lg:top-20"
          >
            <p className="px-2 pb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
              {stepCount} hops · click to jump
            </p>
            <ol className="space-y-0.5">
              {steps.map((entry, index) => {
                const on = index === stepIndex;
                const showPhase =
                  index === 0 ||
                  (entry.chapter ?? "Hop") !== (steps[index - 1]?.chapter ?? "Hop");
                return (
                  <li key={entry.id}>
                    {showPhase ? (
                      <p className="px-2 pb-0.5 pt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground first:pt-0">
                        {entry.chapter ?? "Hop"}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      aria-current={on ? "step" : undefined}
                      title={
                        entry.citation
                          ? `${entry.action} (${entry.citation})`
                          : entry.action
                      }
                      className={cn(
                        "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                        boardFocusClass,
                        on
                          ? "bg-primary/10 text-foreground ring-1 ring-primary/30"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                      onClick={() => goTo(index)}
                    >
                      <span className="mt-0.5 w-5 shrink-0 font-mono text-[11px] text-brass">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm leading-snug text-foreground">
                          {entry.packet?.label ?? entry.action}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider">
                          {entry.citation ?? "hop"}
                        </span>
                        {on ? <YouAreHere className="mt-1" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <div
          className="mt-4 rounded-lg border border-dashed border-border bg-card px-3 py-3 md:px-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
            <span>
              Now · {stepIndex + 1}/{stepCount}
            </span>
            {step.chapter ? (
              <span className="text-brass/80">· {step.chapter}</span>
            ) : null}
            {step.citation ? (
              <span className="text-primary">· {step.citation}</span>
            ) : null}
            <YouAreHere />
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            <span className="font-medium">{fromActor?.label ?? step.from}</span>
            <span className="mx-1.5 text-primary">→</span>
            <span className="font-medium">{toActor?.label ?? step.to}</span>
            <span className="mx-1.5 text-muted-foreground">·</span>
            {step.action}
          </p>
          {step.now ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.now}
            </p>
          ) : null}
          {step.why ? (
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
              <span className="font-mono text-[10px] uppercase tracking-wider text-brass">
                Why{" "}
              </span>
              {step.why}
            </p>
          ) : null}
          {step.caption ? (
            <p className="mt-2 border-l-2 border-brass pl-2 text-sm leading-relaxed text-foreground/90">
              {step.caption}
            </p>
          ) : null}
          {step.note && step.note !== step.now ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {step.note}
            </p>
          ) : null}
          {step.chips && step.chips.length > 0 ? (
            <ChipList chips={step.chips} />
          ) : null}
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${stepIndex + 1} of ${stepCount}: ${step.from} to ${step.to}. ${step.action}${step.citation ? ` ${step.citation}` : ""}`}
      </div>

      {onLastStep && sequence.takeaway ? (
        <p className="mt-3 rounded-lg border border-grant/35 bg-grant/10 px-3 py-2 text-sm leading-relaxed text-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
            Takeaway{" "}
          </span>
          {sequence.takeaway}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className={controlBtnClass}
          aria-label={playing ? "Pause" : "Play"}
          onClick={togglePlay}
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Pause" : "Play"}
        </button>
        <button
          type="button"
          className={iconBtnClass}
          aria-label="Previous step"
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex === 0}
        >
          <SkipBack className="size-3.5" />
        </button>
        <button
          type="button"
          className={iconBtnClass}
          aria-label="Next step"
          onClick={() => goTo(stepIndex + 1)}
          disabled={stepIndex >= stepCount - 1}
        >
          <SkipForward className="size-3.5" />
        </button>
        <button
          type="button"
          className={controlBtnClass}
          aria-label="Restart"
          onClick={() => goTo(0, autoPlay)}
        >
          <RotateCcw className="size-3.5" />
          Restart
        </button>
        <span className="ml-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Speed
        </span>
        {SPEEDS.map((value) => (
          <button
            key={value}
            type="button"
            className={cn(
              "rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
              boardFocusClass,
              speed === value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/45 hover:bg-muted",
            )}
            aria-pressed={speed === value}
            onClick={() => {
              speedRef.current = value;
              setSpeed(value);
            }}
          >
            {value}×
          </button>
        ))}
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
          ← → step · space play
        </span>
      </div>

      {share?.path ? (
        <div className="mt-3">
          <ShareBar
            path={share.path}
            title={share.title}
            hop={{
              number: stepIndex + 1,
              now: step.now,
              caption: step.caption,
            }}
          />
        </div>
      ) : null}

      {footer ? <div className="mt-4">{footer}</div> : null}
    </InOneBoard>
  );
}
