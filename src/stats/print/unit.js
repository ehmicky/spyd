// Use the same unit for all measures
export const getUnit = function(iterations) {
  const medians = iterations.flatMap(getMedianStat)
  const unit = findUnit(medians)
  const scale = UNITS[unit]
  return { unit, scale }
}

const getMedianStat = function({ stats: { median } }) {
  return median
}

const findUnit = function(measures) {
  const measuresA = measures.filter(isNotZero)

  if (measuresA.length === 0) {
    return DEFAULT_UNIT
  }

  const min = Math.min(...measuresA)

  const preciseUnit = Object.entries(UNITS).find(
    ([, minUnit]) => min >= minUnit,
  )

  if (preciseUnit === undefined) {
    return MIN_UNIT
  }

  return preciseUnit[0]
}

const isNotZero = function(measure) {
  return measure !== 0
}

/* eslint-disable id-length */
const UNITS = {
  d: 864e11,
  h: 36e11,
  m: 6e10,
  s: 1e9,
  ms: 1e6,
  μs: 1e3,
  ns: 1,
  ps: 1e-3,
  fs: 1e-6,
}
/* eslint-enable id-length */

const DEFAULT_UNIT = 'ns'
const MIN_UNIT = 'fs'
