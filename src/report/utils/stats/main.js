import { addColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { getPadding, padValue } from './padding.js'
import { addPrefix } from './prefix.js'
import { shouldSkipStat } from './skip.js'
import { STAT_TYPES } from './types.js'
import { getUnit } from './unit.js'
import { serializeValue } from './value.js'

// Add `iteration.stats.*Pretty` which is like `iteration.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (iterations) {
  const { unit, scale } = getUnit(iterations)
  return Object.entries(STAT_TYPES).reduce(
    serializeIterationsStats.bind(undefined, { unit, scale }),
    iterations,
  )
}

const serializeIterationsStats = function (
  { unit, scale },
  iterations,
  [name, type],
) {
  const decimals = getStatsDecimals({ iterations, name, type, scale })
  const iterationsA = iterations.map((iteration) =>
    serializeIterationStat({ iteration, name, type, unit, scale, decimals }),
  )
  const padding = getPadding(name, iterationsA)
  const iterationsB = iterationsA.map((iteration) =>
    finalizeValue({ iteration, name, padding }),
  )
  return iterationsB
}

const serializeIterationStat = function ({
  name,
  iteration,
  iteration: {
    stats,
    stats: { [name]: stat, loops },
  },
  type,
  unit,
  scale,
  decimals,
}) {
  const prettyName = `${name}Pretty`
  const statPretty = serializeStat({
    stat,
    name,
    type,
    unit,
    scale,
    decimals,
    loops,
  })
  return { ...iteration, stats: { ...stats, [prettyName]: statPretty } }
}

const serializeStat = function ({
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

// We pad after values length for each iteration is known.
// We pad before adding colors because ANSI sequences makes padding harder.
const finalizeValue = function ({
  name,
  iteration,
  iteration: { [name]: stat, stats },
  padding,
}) {
  const prettyName = `${name}Pretty`
  const statPretty = stats[prettyName]
  const statPrettyA = finalizeItem({ stat, statPretty, padding, name })
  return { ...iteration, stats: { ...stats, [prettyName]: statPrettyA } }
}

const finalizeItem = function ({ stat, statPretty, padding, name }) {
  const statPrettyA = padValue(statPretty, padding)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}
