// Type of each `stat`.
// Skipped: histogram.
export const STAT_TYPES = {
  median: 'scalar',
  mean: 'scalar',
  min: 'scalar',
  max: 'scalar',
  deviation: 'scalar',
  variance: 'scalar',
  diff: 'percentage',
  count: 'count',
  loops: 'count',
  repeat: 'count',
  processes: 'count',
  percentiles: 'array',
}
