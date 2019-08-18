// Type of each `stat`.
// Skipped: histogram.
export const STAT_TYPES = {
  median: 'scalar',
  mean: 'scalar',
  min: 'scalar',
  max: 'scalar',
  diff: 'percentage',
  deviation: 'percentage',
  variance: 'scalar',
  count: 'count',
  loops: 'count',
  repeat: 'count',
  processes: 'count',
  percentiles: 'array',
}
