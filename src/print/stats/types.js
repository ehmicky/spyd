// Type of each `stat`.
// Skipped: histogram.
export const STAT_TYPES = {
  median: 'scalar',
  mean: 'scalar',
  min: 'scalar',
  max: 'scalar',
  deviation: 'scalar',
  variance: 'scalar',
  diff: 'scalar',
  count: 'count',
  loops: 'count',
  repeat: 'count',
  processes: 'count',
  percentiles: 'array',
}
