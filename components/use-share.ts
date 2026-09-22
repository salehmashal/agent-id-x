"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  hopCaption,
  linkedInShareUrl,
  shareClipboardText,
  shareUrl,
  xIntentUrl,
  type ShareHop,
} from "@/lib/share";

async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to execCommand.
  }
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

export function useShare({
  path,
  title,
  hop,
}: {
  path: string;
  title: string;
  hop?: ShareHop | null;
}) {
  const url = shareUrl(path, hop?.number);
  const line = hopCaption(hop);
  const clipboardText = shareClipboardText({
    title,
    url,
    hopNumber: hop?.number,
    line,
  });
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimer.current != null) clearTimeout(copiedTimer.current);
    };
  }, []);

  const markCopied = useCallback(() => {
    setCopied(true);
    if (copiedTimer.current != null) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }, []);

  const copyLink = useCallback(async () => {
    if (!clipboardText) return false;
    const ok = await copyText(clipboardText);
    if (ok) markCopied();
    return ok;
  }, [clipboardText, markCopied]);

  const nativeShare = useCallback(async () => {
    if (typeof navigator.share !== "function") return false;
    if (!url && !title) return false;
    try {
      await navigator.share({
        ...(title ? { title } : {}),
        ...(line || title ? { text: line || title } : {}),
        ...(url ? { url } : {}),
      });
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return false;
      }
      return false;
    }
  }, [line, title, url]);

  return {
    url,
    clipboardText,
    copied,
    canNativeShare,
    copyLink,
    nativeShare,
    linkedInHref: url ? linkedInShareUrl(url) : "",
    xHref: url ? xIntentUrl(title, url) : "",
    empty: !clipboardText,
    label: hop?.number ? "Share this sequence step" : "Share this page",
  };
}
