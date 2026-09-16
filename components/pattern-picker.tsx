"use client";

import { useState } from "react";
import Link from "next/link";
import { PatternToy } from "@/components/explainers/pattern-toy";
import { Button, buttonVariants } from "@/components/ui/button";
import { boardChoiceClass, boardFocusClass } from "@/lib/identity-visuals";
import { getPattern } from "@/lib/patterns";
import {
  getPickerQuestion,
  PICKER_START,
  type PickerAnswer,
  type PickerResult,
} from "@/lib/pattern-picker";
import { cn } from "@/lib/utils";
import { ChevronRight, RotateCcw } from "lucide-react";

export function PatternPicker() {
  const [history, setHistory] = useState<string[]>([PICKER_START]);
  const [result, setResult] = useState<PickerResult | null>(null);

  const questionId = history[history.length - 1] ?? PICKER_START;
  const question = getPickerQuestion(questionId);

  function choose(answer: PickerAnswer) {
    if (answer.result) {
      setResult(answer.result);
      return;
    }
    if (answer.next) {
      setHistory((prev) => [...prev, answer.next!]);
    }
  }

  function restart() {
    setResult(null);
    setHistory([PICKER_START]);
  }

  function back() {
    if (result) {
      setResult(null);
      return;
    }
    if (history.length <= 1) return;
    setHistory((prev) => prev.slice(0, -1));
  }

  if (result) {
    return <PickerResultCard result={result} onRestart={restart} onBack={back} />;
  }

  if (!question) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Unknown step.{" "}
        <button type="button" className="underline" onClick={restart}>
          Start over
        </button>
      </div>
    );
  }

  return (
    <div
      id="picker"
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 md:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
          What is your shape · {history.length}
          {history.length === 1 ? " question" : " questions"}
        </p>
        {history.length > 1 ? (
          <Button type="button" variant="ghost" size="sm" onClick={back}>
            Back
          </Button>
        ) : null}
      </div>
      <h2 className="mt-2 font-heading text-xl md:text-2xl">{question.prompt}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {question.help} This is an explainer, not a score — it names the
        deployment row you are already in. AAuth p2p, A2A, and did:peer stay on
        separate exits.
      </p>
      <div className="mt-5 space-y-2">
        {question.answers.map((answer) => (
          <button
            key={answer.id}
            type="button"
            onClick={() => choose(answer)}
            className={cn(
              "w-full rounded-lg border px-3 py-3 text-left transition-colors",
              boardFocusClass,
              boardChoiceClass(false),
            )}
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {answer.label}
                </span>
                {answer.hint ? (
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                    {answer.hint}
                  </span>
                ) : null}
              </span>
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PickerResultCard({
  result,
  onRestart,
  onBack,
}: {
  result: PickerResult;
  onRestart: () => void;
  onBack: () => void;
}) {
  const pattern = result.slug ? getPattern(result.slug) : undefined;

  return (
    <div
      id="picker"
      className="scroll-mt-24 rounded-xl border border-moss/35 bg-moss/5 p-5 md:p-6"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brass">
        This is your shape
      </p>
      <h2 className="mt-2 font-heading text-2xl">{result.headline}</h2>
      {pattern ? (
        <div className="mt-3">
          <PatternToy topology={pattern.topology} />
        </div>
      ) : null}
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {result.why}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {pattern ? (
          <Link href={`/patterns/${pattern.slug}`} className={buttonVariants()}>
            Open {pattern.matrixTitle}
          </Link>
        ) : null}
        <Button type="button" variant="outline" onClick={onRestart}>
          <RotateCcw />
          Ask again
        </Button>
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
      </div>
      {result.also.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {result.also.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="font-mono text-xs text-primary hover:underline"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
