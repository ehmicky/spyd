// All `stats.*` properties to prettify
// `histogram` does not need to be prettified.
export const STAT_KINDS = [
  { name: 'mean', kind: 'duration' },
  { name: 'meanMin', kind: 'duration' },
  { name: 'meanMax', kind: 'duration' },
  { name: 'median', kind: 'duration' },
  { name: 'min', kind: 'duration' },
  { name: 'max', kind: 'duration' },
  { name: 'diff', kind: 'percentage', signed: 'diff' },
  { name: 'stdev', kind: 'duration', signed: 'never' },
  { name: 'rstdev', kind: 'percentage', signed: 'never' },
  { name: 'moe', kind: 'duration', signed: 'never' },
  { name: 'rmoe', kind: 'percentage', signed: 'never' },
  { name: 'quantiles', kind: 'duration' },
  { name: 'outliersMin', kind: 'percentage' },
  { name: 'outliersMax', kind: 'percentage' },
  { name: 'times', kind: 'count' },
  { name: 'loops', kind: 'count' },
  { name: 'repeat', kind: 'count' },
  { name: 'samples', kind: 'count' },
  { name: 'minLoopDuration', kind: 'duration' },
]
