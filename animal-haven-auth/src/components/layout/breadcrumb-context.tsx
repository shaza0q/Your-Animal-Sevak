import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface Crumb {
  label: string;
  /** Optional route the crumb links to. The last crumb is rendered as plain text. */
  to?: string;
}

interface BreadcrumbContextValue {
  crumbs: Crumb[] | null;
  setCrumbs: (crumbs: Crumb[] | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [crumbs, setCrumbs] = useState<Crumb[] | null>(null);
  return (
    <BreadcrumbContext.Provider value={{ crumbs, setCrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

function useBreadcrumbContext() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumbs must be used within a BreadcrumbProvider.");
  }
  return ctx;
}

/** Read-only access to the current breadcrumb override (used by the Breadcrumbs renderer). */
export function useCurrentCrumbs() {
  return useBreadcrumbContext().crumbs;
}

/**
 * Declare the breadcrumb trail for the current page. Pass real labels for dynamic
 * segments (farm name, animal tag, case id). Cleared automatically on unmount so
 * pages without an explicit trail fall back to the auto-derived breadcrumbs.
 */
export function useBreadcrumbs(crumbs: Crumb[]) {
  const { setCrumbs } = useBreadcrumbContext();
  // Serialize to keep the effect stable when callers pass a fresh array each render.
  const key = JSON.stringify(crumbs);
  useEffect(() => {
    setCrumbs(crumbs);
    return () => setCrumbs(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setCrumbs]);
}
