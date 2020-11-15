import { getPercentageDirection, roundAbsPercentage } from './percentage.js'
import { shouldSkipStat } from './skip.js'

// Serialize stat into a prettified string
export const serializeStat = function ({
  stat,
  name,
  type,
  unit,
  scale,
  decimals,
  loops,
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeValue({ stat: statA, type, scale, unit, decimals }),
    )
  }

  return serializeValue({ stat, type, scale, unit, decimals })
}

// Serialize a stat's value
const serializeValue = function ({ stat, type, scale, unit, decimals }) {
  return SERIALIZE_STAT[type](stat, { scale, unit, decimals })
}

const serializeCount = function (count) {
  // Adds thousands separators
  return count.toLocaleString()
}

const serializeRelPercentage = function (percentage) {
  const sign = REL_PERCENTAGE_SIGNS[getPercentageDirection(percentage)]
  const roundedPercentage = roundAbsPercentage(percentage)
  return `${sign}${roundedPercentage}%`
}

const REL_PERCENTAGE_SIGNS = { positive: '+', negative: '-', neutral: '' }

const serializeAbsPercentage = function (percentage) {
  const roundedPercentage = roundAbsPercentage(percentage)
  return `${ABS_PERCENTAGE_SIGN}${roundedPercentage}%`
}

// Works on CP437 too
const ABS_PERCENTAGE_SIGN = '±'

const serializeDuration = function (duration, { scale, unit, decimals }) {
  const scaledDuration = duration / scale
  const scaledDurationStr = scaledDuration.toFixed(decimals)
  return `${scaledDurationStr}${unit}`
}

const SERIALIZE_STAT = {
  count: serializeCount,
  relativePercentage: serializeRelPercentage,
  absolutePercentage: serializeAbsPercentage,
  duration: serializeDuration,
}
