import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { BusinessInput } from '../types/business';
import { EMPTY_BUSINESS_INPUT } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';
import { generatePMMAnalysis, regeneratePMMSection } from '../services/pmmService';

interface AppStateValue {
  businessInput: BusinessInput;
  setBusinessInput: (patch: Partial<BusinessInput>) => void;
  resetBusinessInput: () => void;

  analysis: PMMAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  runAnalysis: () => Promise<void>;

  /** Regenerates only the requested section using the selected AI mode. */
  regenerateSection: <K extends keyof PMMAnalysis>(key: K) => Promise<void>;

  resetAll: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const generationVersion = useRef(0);
  const [businessInput, setBusinessInputState] = useState<BusinessInput>(EMPTY_BUSINESS_INPUT);
  const [analysis, setAnalysis] = useState<PMMAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const setBusinessInput = useCallback((patch: Partial<BusinessInput>) => {
    setBusinessInputState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetBusinessInput = useCallback(() => {
    setBusinessInputState(EMPTY_BUSINESS_INPUT);
  }, []);

  const runAnalysis = useCallback(async () => {
    const version = ++generationVersion.current;
    setAnalysis(null);
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await generatePMMAnalysis(businessInput);
      if (version === generationVersion.current) setAnalysis(result);
    } catch (err) {
      if (version === generationVersion.current) setAnalysisError(err instanceof Error ? err.message : 'Something went wrong generating your strategy.');
    } finally {
      if (version === generationVersion.current) setIsAnalyzing(false);
    }
  }, [businessInput]);

  const regenerateSection = useCallback(
    async <K extends keyof PMMAnalysis>(key: K) => {
      const version = generationVersion.current;
      const fresh = await regeneratePMMSection(businessInput, key);
      if (version === generationVersion.current) {
        setAnalysis((prev) => prev ? { ...prev, [key]: fresh } : prev);
      }
    },
    [businessInput]
  );

  const resetAll = useCallback(() => {
    generationVersion.current += 1;
    setBusinessInputState(EMPTY_BUSINESS_INPUT);
    setAnalysis(null);
    setAnalysisError(null);
    setIsAnalyzing(false);
  }, []);

  const value = useMemo(
    () => ({
      businessInput,
      setBusinessInput,
      resetBusinessInput,
      analysis,
      isAnalyzing,
      analysisError,
      runAnalysis,
      regenerateSection,
      resetAll,
    }),
    [businessInput, setBusinessInput, resetBusinessInput, analysis, isAnalyzing, analysisError, runAnalysis, regenerateSection, resetAll]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
