import { serializeRelPercentage, serializeAbsPercentage } from './percentage.js'

// Serialize stat into a prettified string
export const serializeStat = function ({ stat, kind, scale, decimals }) {
  if (shouldSkipStat(stat)) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeValue({ stat: statA, kind, scale, decimals }),
    )
  }

  return serializeValue({ stat, kind, scale, decimals })
}

// Statistics are not shown if undefined (e.g. `diff` with no previous results,
// or not-measure-yet in preview
const shouldSkipStat = function (stat) {
  return stat === undefined
}

// Serialize a stat's value
const serializeValue = function ({ stat, kind, scale, decimals }) {
  return SERIALIZE_STAT[kind](stat, { scale, decimals })
}

const serializeCount = function (count, { scale, decimals }) {
  const scaledCount = roundNumber(count, scale, decimals)
  const exponent = scale === 1 ? '' : `e${Math.log10(scale)}`
  return `${scaledCount}${exponent}`
}

const serializeDuration = function (duration, { scale, decimals }) {
  const scaledDuration = roundNumber(duration, scale, decimals)
  const { unit } = DURATION_UNITS.find(({ scale: scaleA }) => scaleA === scale)
  return `${scaledDuration}${unit}`
}

const roundNumber = function (number, scale, decimals) {
  return (number / scale).toFixed(decimals)
}

const DURATION_UNITS = [
  { unit: 's', scale: 1e9 },
  { unit: 'ms', scale: 1e6 },
  { unit: 'μs', scale: 1e3 },
  { unit: 'ns', scale: 1 },
  { unit: 'ps', scale: 1e-3 },
  { unit: 'fs', scale: 1e-6 },
]

const SERIALIZE_STAT = {
  count: serializeCount,
  duration: serializeDuration,
  relativePercentage: serializeRelPercentage,
  absolutePercentage: serializeAbsPercentage,
}
