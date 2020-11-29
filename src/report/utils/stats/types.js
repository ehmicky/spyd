// Type of each `stat`.
// Skipped: histogram.
export const STAT_TYPES = [
  { name: 'median', type: 'duration' },
  { name: 'mean', type: 'duration' },
  { name: 'min', type: 'duration' },
  { name: 'max', type: 'duration' },
  { name: 'diff', type: 'relativePercentage' },
  { name: 'limit', type: 'duration' },
  { name: 'deviation', type: 'absolutePercentage' },
  { name: 'times', type: 'count' },
  { name: 'loops', type: 'count' },
  { name: 'repeat', type: 'count' },
  { name: 'processes', type: 'count' },
  { name: 'loadCost', type: 'duration' },
  { name: 'measureCost', type: 'duration' },
  { name: 'repeatCost', type: 'duration' },
  { name: 'quantiles', type: 'duration' },
]
