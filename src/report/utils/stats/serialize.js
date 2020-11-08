import { addPrefix } from './prefix.js'
import { shouldSkipStat } from './skip.js'
import { serializeValue } from './value.js'

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
      serializeItem({ stat: statA, type, name, scale, unit, decimals }),
    )
  }

  return serializeItem({ stat, type, name, scale, unit, decimals })
}

const serializeItem = function ({ stat, type, name, scale, unit, decimals }) {
  const statPretty = serializeValue({ stat, type, scale, unit, decimals })
  const statPrettyA = addPrefix(stat, statPretty, name)
  return statPrettyA
}
