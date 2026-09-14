"use client";

/**
 * Это базовая защита от случайного скачивания рядовым пользователем через правый клик или drag-n-drop.
 * Полноценная защита от скачивания через DevTools/Network tab технически невозможна без платного DRM-сервиса (Mux, Cloudflare Stream с подписанными URL).
 */

import {
  forwardRef,
  useEffect,
  useRef,
  type DragEvent,
  type Ref,
  type VideoHTMLAttributes,
} from "react";

function preventDrag(event: DragEvent<HTMLElement>) {
  event.preventDefault();
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(node);
    return;
  }
  ref.current = node;
}

export const ProtectedVideo = forwardRef<
  HTMLVideoElement,
  VideoHTMLAttributes<HTMLVideoElement>
>(function ProtectedVideo(
  {
    className,
    onDragStart,
    muted,
    autoPlay,
    loop,
    playsInline,
    ...props
  },
  ref,
) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (muted) {
      video.muted = true;
      video.setAttribute("muted", "");
    }
    if (playsInline) {
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "true");
    }
    if (loop) {
      video.loop = true;
      video.setAttribute("loop", "");
    }
    if (autoPlay) {
      video.autoplay = true;
      video.setAttribute("autoplay", "");
      void videoRef.current?.play()?.catch(() => {});
    }
  }, [autoPlay, muted, loop, playsInline, props.src]);

  return (
    <div className="h-full w-full" onDragStart={preventDrag}>
      <video
        {...props}
        ref={(node) => {
          videoRef.current = node;
          assignRef(ref, node);
        }}
        className={className}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline={playsInline}
        controlsList="nodownload noremoteplayback nofullscreen"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        onDragStart={(event) => {
          preventDrag(event);
          onDragStart?.(event);
        }}
      />
    </div>
  );
});
