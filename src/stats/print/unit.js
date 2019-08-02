import { STAT_TYPES } from './types.js'

export const getUnits = function(iterations) {
  const units = Object.entries(STAT_TYPES).map(([name, type]) =>
    getUnit({ name, type, iterations }),
  )
  return Object.fromEntries(units)
}

const getUnit = function({ name, type, iterations }) {
  if (type === 'count' || type === 'skip') {
    return [name, {}]
  }

  const allStats = iterations.flatMap(({ stats }) => stats[name])
  const { unit, scale } = findPreciseUnit(allStats)
  return [name, { unit, scale }]
}

const findPreciseUnit = function(floats) {
  const unit = findUnit(floats)
  const scale = UNITS[unit]
  return { unit, scale }
}

const findUnit = function(floats) {
  const floatsA = floats.filter(isNotZero)

  if (floatsA.length === 0) {
    return DEFAULT_UNIT
  }

  const float = Math.min(...floatsA)

  const preciseUnit = Object.entries(UNITS).find(([, minUnit]) =>
    isPreciseUnit(float, minUnit),
  )

  if (preciseUnit === undefined) {
    return MIN_UNIT
  }

  return preciseUnit[0]
}

const isNotZero = function(number) {
  return number !== 0
}

const isPreciseUnit = function(float, minUnit) {
  const minPrecision = minUnit * MIN_PRECISION
  return float >= minPrecision
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
const MIN_PRECISION = 1e1
