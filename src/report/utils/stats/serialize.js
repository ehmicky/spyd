import { getEpsilon, applyEpsilon } from './epsilon.js'
import { serializeRelPercentage, serializeAbsPercentage } from './percentage.js'
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
}) {
  if (shouldSkipStat({ stat, name, loops })) {
    return ''
  }

  const epsilon = getEpsilon(measureCost, repeat)

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      serializeValue({
        stat: statA,
        name,
        type,
        scale,
        unit,
        decimals,
        epsilon,
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
    epsilon,
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
  epsilon,
}) {
  return SERIALIZE_STAT[type](stat, { name, scale, unit, decimals, epsilon })
}

const serializeCount = function (count) {
  // Adds thousands separators
  return count.toLocaleString()
}

const serializeDuration = function (
  duration,
  { name, scale, unit, decimals, epsilon },
) {
  const { duration: durationA, prefix } = applyEpsilon({
    duration,
    name,
    epsilon,
  })
  const scaledDuration = durationA / scale
  const scaledDurationStr = scaledDuration.toFixed(decimals)
  return `${prefix}${scaledDurationStr}${unit}`
}

const SERIALIZE_STAT = {
  count: serializeCount,
  duration: serializeDuration,
  relativePercentage: serializeRelPercentage,
  absolutePercentage: serializeAbsPercentage,
}
