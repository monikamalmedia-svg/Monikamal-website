"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const HIDE_MS = 2400;

export function useAutoHideVideoControls() {
  const [visible, setVisible] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (hideTimer.current == null) return;
    window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setCanHover(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const reveal = useCallback(() => {
    setVisible(true);
    clearTimer();
    hideTimer.current = window.setTimeout(() => {
      setVisible(false);
      hideTimer.current = null;
    }, HIDE_MS);
  }, [clearTimer]);

  const onMouseEnter = useCallback(() => {
    if (!canHover) return;
    clearTimer();
    setVisible(true);
  }, [canHover, clearTimer]);

  const onMouseLeave = useCallback(() => {
    if (!canHover) return;
    clearTimer();
    setVisible(false);
  }, [canHover, clearTimer]);

  return { visible, canHover, reveal, onMouseEnter, onMouseLeave };
}

export function enterVideoFullscreen(video: HTMLVideoElement) {
  const iosVideo = video as HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
  };

  if (typeof iosVideo.webkitEnterFullscreen === "function") {
    iosVideo.webkitEnterFullscreen();
    return;
  }

  if (video.requestFullscreen) {
    void video.requestFullscreen();
    return;
  }

  const wrap = video.parentElement;
  if (wrap?.requestFullscreen) {
    void wrap.requestFullscreen();
  }
}
