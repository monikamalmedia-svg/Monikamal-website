"use client";

/**
 * Это базовая защита от случайного скачивания рядовым пользователем через правый клик или drag-n-drop.
 * Полноценная защита от скачивания через DevTools/Network tab технически невозможна без платного DRM-сервиса (Mux, Cloudflare Stream с подписанными URL).
 */

import { forwardRef, type DragEvent, type VideoHTMLAttributes } from "react";

function preventDrag(event: DragEvent<HTMLElement>) {
  event.preventDefault();
}

export const ProtectedVideo = forwardRef<
  HTMLVideoElement,
  VideoHTMLAttributes<HTMLVideoElement>
>(function ProtectedVideo(
  { className, onDragStart, muted, defaultMuted, ...props },
  ref,
) {
  return (
    <div className="h-full w-full" onDragStart={preventDrag}>
      <video
        {...props}
        ref={ref}
        muted={muted ?? Boolean(defaultMuted)}
        className={className}
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
