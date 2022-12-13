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
  { name: 'diffLimit', kind: 'percentage' },
  { name: 'stdev', kind: 'duration', signed: 'never' },
  { name: 'rstdev', kind: 'percentage', signed: 'never' },
  { name: 'moe', kind: 'duration', signed: 'never' },
  { name: 'rmoe', kind: 'percentage', signed: 'never' },
  { name: 'cold', kind: 'percentageCount', signed: 'never' },
  { name: 'quantiles', kind: 'duration' },
  { name: 'outliersMin', kind: 'percentage' },
  { name: 'outliersMax', kind: 'percentage' },
  { name: 'times', kind: 'count' },
  { name: 'loops', kind: 'count' },
  { name: 'repeat', kind: 'count' },
  { name: 'samples', kind: 'count' },
  { name: 'envDev', kind: 'count' },
  { name: 'minLoopDuration', kind: 'duration' },
  { name: 'runDuration', kind: 'duration', ownScale: true },
]

// Some stats have multiple kinds, depending on their scale.
// This is useful to show when a different scale|unit is more proper depending
// on how low|high the value is.
export const getSingleKind = (minMeasure, kind) => {
  const getKind = MULTIPLE_KINDS[kind]
  return getKind === undefined ? kind : getKind(minMeasure)
}

const getPercentageCountKind = (minMeasure) =>
  minMeasure >= PERCENTAGE_MIN_VALUE ? 'percentage' : 'count'

// Chosen so that `cold` can represent the threshold of the highest `precision`
// as percentage, but represent anything lower as count, to avoid showing too
// many zeroes.
const PERCENTAGE_MIN_VALUE = 1e-5

const MULTIPLE_KINDS = {
  percentageCount: getPercentageCountKind,
}
