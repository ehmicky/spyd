// Retrieve unit shown after the stat, depending on its scale
export const getUnit = function (kind, scale) {
  return UNITS[kind](scale)
}

const getCountUnit = function (scale) {
  return scale === 1 ? '' : `e${Math.log10(scale)}`
}

const getPercentageUnit = function () {
  return '%'
}

const getDurationUnit = function (scale) {
  return DURATION_UNITS.get(scale)
}

/* eslint-disable no-magic-numbers */
const DURATION_UNITS = new Map([
  [1e9, 's'],
  [1e6, 'ms'],
  [1e3, 'μs'],
  [1, 'ns'],
  [1e-3, 'ps'],
  [1e-6, 'fs'],
])
/* eslint-enable no-magic-numbers */

const UNITS = {
  count: getCountUnit,
  percentage: getPercentageUnit,
  duration: getDurationUnit,
}
