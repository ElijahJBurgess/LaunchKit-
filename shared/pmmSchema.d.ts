export function isSection(section: unknown): boolean;
export function isAnalysisPayload(value: unknown, section?: string): boolean;
export function schemaFor(section?: string): Record<string, unknown>;
export const analysisSchema: Record<string, unknown>;
