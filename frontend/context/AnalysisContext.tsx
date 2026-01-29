"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Analysis = {
  id: string;

  // Creator / channel identity
  channelId?: string;
  channelName: string;
  channelUrl?: string;
  region?: string;
  subscribers?: number;

  // Key metrics (store the essentials for MVP)
  medianViews?: number;
  averageViews?: number;
  riskLevel?: string;

  // Pricing inputs (NEW)
  clientCurrency?: string; // e.g. "ZAR"
  creatorCurrency?: string; // e.g. "ZAR"
  quotedFeeClient?: number; // brand quoted fee (in client currency)
  targetMarginPct?: number; // 0–100
  targetCpm?: number; // optional KPI (in client currency)

  createdAt: string;
};

type State = {
  byId: Record<string, Analysis>;
  recentIds: string[];
  activeId: string | null;
};

type Ctx = {
  state: State;

  upsertAnalysis: (a: Analysis) => void;
  setActive: (id: string) => void;
  removeAnalysis: (id: string) => void;
  clearAll: () => void;

  getActive: () => Analysis | null;
};

const STORAGE_KEY = "ii.analysis.v1";

const AnalysisContext = createContext<Ctx | null>(null);

function safeParse(json: string | null): State | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    // ultra-light validation
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.byId || !parsed.recentIds) return null;
    return parsed as State;
  } catch {
    return null;
  }
}

const initialState: State = { byId: {}, recentIds: [], activeId: null };

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);

  // Load from localStorage (client-only)
  useEffect(() => {
    const loaded = safeParse(localStorage.getItem(STORAGE_KEY));
    if (loaded) setState(loaded);
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const upsertAnalysis = (a: Analysis) => {
    setState((prev) => {
      const byId = { ...prev.byId, [a.id]: a };

      // Move to top of recents
      const recentIds = [
        a.id,
        ...prev.recentIds.filter((x) => x !== a.id),
      ].slice(0, 12);

      return {
        byId,
        recentIds,
        activeId: a.id,
      };
    });
  };

  const setActive = (id: string) => {
    setState((prev) => {
      if (!prev.byId[id]) return prev;
      const recentIds = [id, ...prev.recentIds.filter((x) => x !== id)];
      return { ...prev, activeId: id, recentIds };
    });
  };

  const removeAnalysis = (id: string) => {
    setState((prev) => {
      if (!prev.byId[id]) return prev;
      const byId = { ...prev.byId };
      delete byId[id];

      const recentIds = prev.recentIds.filter((x) => x !== id);

      const activeId =
        prev.activeId === id ? (recentIds[0] ?? null) : prev.activeId;

      return { byId, recentIds, activeId };
    });
  };

  const clearAll = () => setState(initialState);

  const getActive = () => {
    if (!state.activeId) return null;
    return state.byId[state.activeId] ?? null;
  };

  const value = useMemo<Ctx>(
    () => ({
      state,
      upsertAnalysis,
      setActive,
      removeAnalysis,
      clearAll,
      getActive,
    }),
    [state],
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}
