// Type of each `stat`.
// Skipped: histogram.
export const STAT_TYPES = [
  { name: 'median', type: 'duration' },
  { name: 'mean', type: 'duration' },
  { name: 'min', type: 'duration' },
  { name: 'max', type: 'duration' },
  { name: 'diff', type: 'relativePercentage' },
  { name: 'deviation', type: 'absolutePercentage' },
  { name: 'times', type: 'count' },
  { name: 'loops', type: 'count' },
  { name: 'repeat', type: 'count' },
  { name: 'samples', type: 'count' },
  { name: 'minLoopDuration', type: 'duration' },
  { name: 'quantiles', type: 'duration' },
]
