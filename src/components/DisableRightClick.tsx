"use client";

import type { ReactNode } from "react";
import { useDisableRightClick } from "@/hooks/useDisableRightClick";

export function DisableRightClick({ children }: { children: ReactNode }) {
  useDisableRightClick();
  return children;
}
