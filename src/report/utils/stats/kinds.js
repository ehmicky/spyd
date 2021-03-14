// Kind of each `stat`.
// Skipped: histogram.
export const STAT_KINDS = [
  { name: 'median', kind: 'duration' },
  { name: 'mean', kind: 'duration' },
  { name: 'min', kind: 'duration' },
  { name: 'max', kind: 'duration' },
  { name: 'low', kind: 'duration' },
  { name: 'high', kind: 'duration' },
  { name: 'diff', kind: 'relativePercentage' },
  { name: 'deviation', kind: 'absolutePercentage' },
  { name: 'times', kind: 'count' },
  { name: 'loops', kind: 'count' },
  { name: 'repeat', kind: 'count' },
  { name: 'samples', kind: 'count' },
  { name: 'minLoopDuration', kind: 'duration' },
  { name: 'quantiles', kind: 'duration' },
]
