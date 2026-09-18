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
  type ReactNode,
} from "react";
import { InOneBoard, Pass, Piece } from "@/components/explainers/shared";
import { Button } from "@/components/ui/button";
import { boardFocusClass } from "@/lib/identity-visuals";
import type {
  AnimationHeldToken,
  AnimationStep,
  PacketKind,
  ProtocolAnimation,
} from "@/lib/animations";
import { DEFAULT_DURATION_MS } from "@/lib/animations";
import { cn } from "@/lib/utils";

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
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

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

function ActorColumn({
  actorId,
  label,
  kind,
  active,
  challenge,
  tokens,
  register,
}: {
  actorId: string;
  label: string;
  kind: ProtocolAnimation["actors"][number]["kind"];
  active: boolean;
  challenge: boolean;
  tokens: AnimationHeldToken[];
  register: (id: string, node: HTMLElement | null) => void;
}) {
  return (
    <div
      ref={(node) => register(actorId, node)}
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 md:flex-col md:items-center md:text-center",
        challenge && "sequence-challenge rounded-lg p-1",
      )}
    >
      <Piece kind={kind} label={label} size="sm" active={active} />
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

export function SequencePlayer({
  sequence,
  autoPlay = true,
  compact = false,
  footer,
}: {
  sequence: ProtocolAnimation;
  autoPlay?: boolean;
  compact?: boolean;
  footer?: ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const steps = sequence.steps;
  const stepCount = steps.length;
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  const stageRef = useRef<HTMLDivElement>(null);
  const packetRef = useRef<HTMLDivElement>(null);
  const actorNodes = useRef(new Map<string, HTMLElement>());
  const stepIndexRef = useRef(0);
  const playingRef = useRef(false);
  const speedRef = useRef(speed);
  const progressRef = useRef(progress);
  const reducedRef = useRef(reduced);

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
    setStepIndex(0);
    setProgress(reduced ? 1 : 0);
    progressRef.current = reduced ? 1 : 0;
    setPlaying(autoPlay && !reduced);
  }, [sequence.id, autoPlay, reduced]);

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
    const x = lerp(fx, tx, flyT);
    const y = lerp(fy, ty, flyT) + Math.sin(flyT * Math.PI) * 28;
    packet.style.opacity = "1";
    packet.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  }, []);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      const step = steps[stepIndexRef.current];
      if (step) {
        if (reducedRef.current) {
          progressRef.current = 1;
          placePacket(1, step);
        } else if (playingRef.current) {
          const duration =
            (step.durationMs ?? DEFAULT_DURATION_MS) / speedRef.current;
          let next = progressRef.current + dt / duration;
          if (next >= 1) {
            const lastStep = stepIndexRef.current >= steps.length - 1;
            if (lastStep && sequence.loop !== false) {
              stepIndexRef.current = 0;
              setStepIndex(0);
              next = 0;
            } else if (lastStep) {
              next = 1;
              playingRef.current = false;
              setPlaying(false);
            } else {
              const upcoming = stepIndexRef.current + 1;
              stepIndexRef.current = upcoming;
              setStepIndex(upcoming);
              next = 0;
            }
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
  const chapter = step?.chapter;

  function goTo(index: number, startPlaying = false) {
    const next = Math.max(0, Math.min(stepCount - 1, index));
    stepIndexRef.current = next;
    setStepIndex(next);
    const p = reduced ? 1 : 0;
    progressRef.current = p;
    setProgress(p);
    playingRef.current = startPlaying && !reduced;
    setPlaying(startPlaying && !reduced);
  }

  if (!step) return null;

  return (
    <InOneBoard
      kicker={sequence.kicker}
      title={sequence.title}
      footnote={compact ? undefined : sequence.footnote}
    >
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {sequence.summary}
      </p>
      {reduced ? (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-brass">
          Stepped mode — continuous motion is off (prefers-reduced-motion)
        </p>
      ) : null}

      <div
        ref={stageRef}
        className="relative mt-4 overflow-x-auto rounded-lg border border-dashed border-border bg-muted/30 p-3 pb-10 md:p-4 md:pb-12"
      >
        <div className="flex flex-col gap-3 md:min-w-[44rem] md:flex-row md:items-start md:justify-between md:gap-2 lg:min-w-0">
          {sequence.actors.map((item) => (
            <ActorColumn
              key={item.id}
              actorId={item.id}
              label={item.label}
              kind={item.kind}
              active={item.id === step.from || item.id === step.to}
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

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${stepIndex + 1} of ${stepCount}: ${step.from} to ${step.to}. ${step.action}`}
      </div>

      {chapter ? (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
          {chapter}
        </p>
      ) : null}

      <p className="mt-2 text-sm leading-relaxed text-foreground/90">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          {stepIndex + 1}/{stepCount}
          <span className="mx-2 text-primary">→</span>
        </span>
        {step.action}
      </p>
      {step.note ? (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {step.note}
        </p>
      ) : null}

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-1.5",
          compact && "gap-1",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => {
            if (reduced) return;
            const next = !playing;
            playingRef.current = next;
            setPlaying(next);
          }}
          disabled={reduced}
        >
          {playing ? <Pause /> : <Play />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Previous step"
          onClick={() => goTo(stepIndex - 1)}
          disabled={stepIndex === 0}
        >
          <SkipBack />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Next step"
          onClick={() => goTo(stepIndex + 1)}
          disabled={stepIndex >= stepCount - 1}
        >
          <SkipForward />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Restart"
          onClick={() => goTo(0, autoPlay && !reduced)}
        >
          <RotateCcw />
          Restart
        </Button>
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
                : "border-border text-muted-foreground hover:border-primary/45",
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
      </div>

      {!compact ? (
        <div
          role="tablist"
          aria-label="Sequence steps"
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {steps.map((entry, index) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={index === stepIndex}
              className={cn(
                "rounded-md border px-2 py-1 font-mono text-[11px] transition-colors",
                boardFocusClass,
                index === stepIndex
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/45",
              )}
              onClick={() => goTo(index)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
      ) : null}

      {footer ? <div className="mt-4">{footer}</div> : null}
    </InOneBoard>
  );
}
