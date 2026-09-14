"use client";

import { useEffect } from "react";

export function useDisableRightClick() {
  useEffect(() => {
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    return () => document.removeEventListener("contextmenu", onContextMenu);
  }, []);
}
