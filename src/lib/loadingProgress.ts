const SEGMENTS = [
  { start: 0, end: 15_000, from: 8, to: 20 },
  { start: 15_000, end: 35_000, from: 20, to: 35 },
  { start: 35_000, end: 55_000, from: 35, to: 50 },
  { start: 55_000, end: 75_000, from: 50, to: 65 },
  { start: 75_000, end: 95_000, from: 65, to: 80 },
  { start: 95_000, end: 115_000, from: 80, to: 94 },
] as const;

export function progressAt(elapsedMs: number): number {
  const elapsed = Math.max(0, elapsedMs);
  const segment = SEGMENTS.find(({ end }) => elapsed <= end);
  if (segment) {
    const ratio = (elapsed - segment.start) / (segment.end - segment.start);
    return Math.round((segment.from + (segment.to - segment.from) * ratio) * 10) / 10;
  }
  const creep = 94 + 4 * (1 - Math.exp(-(elapsed - 115_000) / 120_000));
  return Math.min(98, Math.round(creep * 10) / 10);
}

export function loadingCopyAt(elapsedMs: number): string {
  if (elapsedMs < 25_000) return 'Understanding your business…';
  if (elapsedMs < 65_000) return 'Connecting your audience, positioning, and messaging…';
  if (elapsedMs < 100_000) return 'Building your go-to-market plan…';
  return 'Finishing your strategy…';
}

export function activeStepAt(elapsedMs: number, stepCount: number): number {
  return Math.min(stepCount - 1, Math.floor((progressAt(elapsedMs) / 99) * stepCount));
}
