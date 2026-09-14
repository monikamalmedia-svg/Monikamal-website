import type { ReactNode } from "react";

export function ScrollRoot({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {children}
    </div>
  );
}
