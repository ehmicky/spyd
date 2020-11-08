import { addColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { getPadding, padValue } from './padding.js'
import { serializeStat } from './serialize.js'
import { STAT_TYPES } from './types.js'
import { getUnit } from './unit.js'

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
  const prettyName = getPrettyName(name)
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

// Add paddings and colors after stats have been prettified
// We pad after values length for each iteration is known.
// We pad before adding colors because ANSI sequences makes padding harder.
const finalizeValue = function ({
  name,
  iteration,
  iteration: {
    stats,
    stats: { [name]: stat },
  },
  padding,
}) {
  const prettyName = getPrettyName(name)
  const statPretty = stats[prettyName]
  const statPrettyA = Array.isArray(stat)
    ? stat.map((statA, index) =>
        finalizeItem({
          stat: statA,
          statPretty: statPretty[index],
          padding,
          name,
        }),
      )
    : finalizeItem({ stat, statPretty, padding, name })
  return { ...iteration, stats: { ...stats, [prettyName]: statPrettyA } }
}

const finalizeItem = function ({ stat, statPretty, padding, name }) {
  const statPrettyA = padValue(statPretty, padding)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}

const getPrettyName = function (name) {
  return `${name}Pretty`
}
