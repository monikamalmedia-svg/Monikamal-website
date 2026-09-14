"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type SelectedPackageContextValue = {
  packageLabel: string | null;
  selectionVersion: number;
  selectPackage: (label: string) => void;
  clearPackage: () => void;
};

const SelectedPackageContext = createContext<SelectedPackageContextValue | null>(
  null,
);

function scrollToContact() {
  document.getElementById("contact")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SelectedPackageProvider({ children }: { children: ReactNode }) {
  const [packageLabel, setPackageLabel] = useState<string | null>(null);
  const [selectionVersion, setSelectionVersion] = useState<number>(0);

  const selectPackage = useCallback((label: string) => {
    setPackageLabel(label);
    setSelectionVersion((current) => current + 1);
    scrollToContact();
  }, []);

  const clearPackage = useCallback(() => {
    setPackageLabel(null);
    setSelectionVersion(0);
  }, []);

  const value = useMemo(
    () => ({ packageLabel, selectionVersion, selectPackage, clearPackage }),
    [packageLabel, selectionVersion, selectPackage, clearPackage],
  );

  return (
    <SelectedPackageContext.Provider value={value}>
      {children}
    </SelectedPackageContext.Provider>
  );
}

export function useSelectedPackage() {
  const context = useContext(SelectedPackageContext);
  if (!context) {
    throw new Error("useSelectedPackage must be used within SelectedPackageProvider");
  }

  return {
    packageLabel: context.packageLabel ?? null,
    selectionVersion: context.selectionVersion ?? 0,
    selectPackage: context.selectPackage,
    clearPackage: context.clearPackage,
  };
}
