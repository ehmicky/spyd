import { getMinDuration, applyMinDuration } from './min_duration.js'
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
  repeat,
  measureCost,
  repeatCost,
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  const minDuration = getMinDuration({ repeat, measureCost, repeatCost })

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeValue({
        stat: statA,
        name,
        type,
        scale,
        unit,
        decimals,
        minDuration,
      }),
    )
  }

  return serializeValue({
    stat,
    name,
    type,
    scale,
    unit,
    decimals,
    minDuration,
  })
}

// Serialize a stat's value
const serializeValue = function ({
  stat,
  name,
  type,
  scale,
  unit,
  decimals,
  minDuration,
}) {
  return SERIALIZE_STAT[type](stat, {
    name,
    scale,
    unit,
    decimals,
    minDuration,
  })
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

const serializeDuration = function (
  duration,
  { name, scale, unit, decimals, minDuration },
) {
  const { duration: durationA, prefix } = applyMinDuration({
    duration,
    name,
    minDuration,
  })
  const scaledDuration = durationA / scale
  const scaledDurationStr = scaledDuration.toFixed(decimals)
  return `${prefix}${scaledDurationStr}${unit}`
}

const SERIALIZE_STAT = {
  count: serializeCount,
  relativePercentage: serializeRelPercentage,
  absolutePercentage: serializeAbsPercentage,
  duration: serializeDuration,
}
