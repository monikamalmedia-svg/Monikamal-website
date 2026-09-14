"use client";

import type { DragEvent, ImgHTMLAttributes } from "react";

function preventDrag(event: DragEvent<HTMLImageElement>) {
  event.preventDefault();
}

export function ProtectedImage({
  alt,
  onDragStart,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={alt ?? ""}
      draggable={false}
      onDragStart={(event) => {
        preventDrag(event);
        onDragStart?.(event);
      }}
    />
  );
}
