// Retrieve unit shown after the stat, depending on its scale
export const getUnit = (kind, scale) => UNITS[kind](scale)

const getCountUnit = (scale) => (scale === 1 ? '' : `e${Math.log10(scale)}`)

const getPercentageUnit = () => '%'

const getDurationUnit = (scale) => DURATION_UNITS.get(scale)

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
