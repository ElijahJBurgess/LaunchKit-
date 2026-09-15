import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { BusinessInput } from '../types/business';
import { EMPTY_BUSINESS_INPUT } from '../types/business';
import type { PMMAnalysis } from '../types/pmm';
import { generatePMMAnalysis } from '../services/pmmService';
import { generateMockAnalysis } from '../data/mockPMMAnalysis';

interface AppStateValue {
  businessInput: BusinessInput;
  setBusinessInput: (patch: Partial<BusinessInput>) => void;
  resetBusinessInput: () => void;

  analysis: PMMAnalysis | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  runAnalysis: () => Promise<void>;

  /** Regenerates a single top-level section of the analysis (mock behavior for now). */
  regenerateSection: <K extends keyof PMMAnalysis>(key: K) => void;

  resetAll: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
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
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const result = await generatePMMAnalysis(businessInput);
      setAnalysis(result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Something went wrong generating your strategy.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [businessInput]);

  const regenerateSection = useCallback(
    <K extends keyof PMMAnalysis>(key: K) => {
      setAnalysis((prev) => {
        if (!prev) return prev;
        const fresh = generateMockAnalysis({ ...businessInput, additionalContext: businessInput.additionalContext + ' ' + Date.now() });
        return { ...prev, [key]: fresh[key] };
      });
    },
    [businessInput]
  );

  const resetAll = useCallback(() => {
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
