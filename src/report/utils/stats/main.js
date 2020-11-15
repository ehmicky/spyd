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
  return STAT_TYPES.reduce(
    prettifyIterationsStat.bind(undefined, { unit, scale }),
    iterations,
  )
}

const prettifyIterationsStat = function (
  { unit, scale },
  iterations,
  { name, type },
) {
  const prettyName = `${name}Pretty`
  const decimals = getStatsDecimals({ iterations, name, type, scale })
  const iterationsA = iterations.map((iteration) =>
    prettifyIterationStat({
      iteration,
      name,
      prettyName,
      type,
      unit,
      scale,
      decimals,
    }),
  )
  const padding = getPadding(prettyName, iterationsA)
  const iterationsB = iterationsA.map((iteration) =>
    finalizeValue({ iteration, name, prettyName, padding }),
  )
  return iterationsB
}

const prettifyIterationStat = function ({
  name,
  prettyName,
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
  prettyName,
  iteration,
  iteration: {
    stats,
    stats: { [name]: stat, [prettyName]: statPretty },
  },
  padding,
}) {
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
