// Kind of each `stat`.
// Skipped: histogram.
export const STAT_KINDS = [
  { name: 'median', kind: 'duration' },
  { name: 'mean', kind: 'duration' },
  { name: 'min', kind: 'duration' },
  { name: 'max', kind: 'duration' },
  { name: 'low', kind: 'duration' },
  { name: 'high', kind: 'duration' },
  { name: 'diff', kind: 'percentage', signed: 'always' },
  { name: 'stdev', kind: 'duration', signed: 'never' },
  { name: 'moe', kind: 'percentage', signed: 'never' },
  { name: 'times', kind: 'count' },
  { name: 'loops', kind: 'count' },
  { name: 'repeat', kind: 'count' },
  { name: 'samples', kind: 'count' },
  { name: 'minLoopDuration', kind: 'duration' },
  { name: 'quantiles', kind: 'duration' },
]
