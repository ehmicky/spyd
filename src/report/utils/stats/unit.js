// Retrieve the time unit to use in `stats.*Pretty`.
// The same unit is used for all `stats.*Pretty` to make it easier to compare
// between stats.
// We use the minimum time unit where all medians are >= 1
export const getUnit = function (iterations) {
  const medians = iterations.map(getMedianStat).filter(isNotZero)

  if (medians.length === 0) {
    return DEFAULT_UNIT
  }

  const min = Math.min(...medians)
  const preciseUnit = UNITS.find(({ scale }) => min >= scale)

  if (preciseUnit === undefined) {
    return MIN_UNIT
  }

  return preciseUnit
}

const getMedianStat = function ({ stats: { median } }) {
  return median
}

const isNotZero = function (median) {
  return median !== 0
}

// When all medians are 0, i.e. could not measure precisely enough.
const DEFAULT_UNIT = { unit: 'ns', scale: 1 }
// When all medians are extremely fast. Failsafe unlikely to happen.
const MIN_UNIT = { unit: 'fs', scale: 1e-6 }
// The maximum unit is seconds:
//  - minutes require writing two units (e.g. 1m56s) which is harder to read
//  - minutes are not base 10 which makes it harder to visually compare
//  - hours-long tasks are unlikely
const UNITS = [
  { unit: 's', scale: 1e9 },
  { unit: 'ms', scale: 1e6 },
  { unit: 'μs', scale: 1e3 },
  DEFAULT_UNIT,
  { unit: 'ps', scale: 1e-3 },
  MIN_UNIT,
]
