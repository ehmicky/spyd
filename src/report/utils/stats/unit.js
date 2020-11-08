// Retrieve the time unit to use in `stats.*Pretty`.
// The same unit is used for all `stats.*Pretty` to make it easier to compare
// between stats.
// We use the minimum time unit where all medians are >= 1
export const getUnit = function (iterations) {
  const medians = iterations.flatMap(getMedianStat)
  const unit = findUnit(medians)
  const scale = UNITS[unit]
  return { unit, scale }
}

const getMedianStat = function ({ stats: { median } }) {
  return median
}

const findUnit = function (medians) {
  const mediansA = medians.filter(isNotZero)

  // When all medians are 0
  if (mediansA.length === 0) {
    return DEFAULT_UNIT
  }

  const min = Math.min(...mediansA)

  const preciseUnit = Object.entries(UNITS).find(
    ([, minUnit]) => min >= minUnit,
  )

  // When all medians are extremely fast. Failsafe unlikely to happen.
  if (preciseUnit === undefined) {
    return MIN_UNIT
  }

  return preciseUnit[0]
}

const isNotZero = function (median) {
  return median !== 0
}

// The maximum unit is seconds:
//  - minutes require writing two units (e.g. 1m56s) which is harder to read
//  - minutes are not base 10 which makes it harder to visually compare
//  - hours-long tasks are unlikely
// eslint-disable-next-line id-length
const UNITS = { s: 1e9, ms: 1e6, μs: 1e3, ns: 1, ps: 1e-3, fs: 1e-6 }

const DEFAULT_UNIT = 'ns'
const MIN_UNIT = 'fs'
