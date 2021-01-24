import { serializeRelPercentage, serializeAbsPercentage } from './percentage.js'
import { shouldSkipStat } from './skip.js'

// Serialize stat into a prettified string
export const serializeStat = function ({
  stat,
  name,
  type,
  scale,
  decimals,
  loops,
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeValue({ stat: statA, type, scale, decimals }),
    )
  }

  return serializeValue({ stat, type, scale, decimals })
}

// Serialize a stat's value
const serializeValue = function ({ stat, type, scale, decimals }) {
  return SERIALIZE_STAT[type](stat, { scale, decimals })
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
