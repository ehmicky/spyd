import { addColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { getPadding, padValue } from './padding.js'
import { serializeStat } from './serialize.js'
import { STAT_TYPES } from './types.js'
import { getUnit } from './unit.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  const { unit, scale } = getUnit(combinations)
  return STAT_TYPES.reduce(
    prettifyCombinationsStat.bind(undefined, { unit, scale }),
    combinations,
  )
}

const prettifyCombinationsStat = function (
  { unit, scale },
  combinations,
  { name, type },
) {
  const prettyName = `${name}Pretty`
  const decimals = getStatsDecimals({ combinations, name, type, scale })
  const combinationsA = combinations.map((combination) =>
    prettifyCombinationStat({
      combination,
      name,
      prettyName,
      type,
      unit,
      scale,
      decimals,
    }),
  )
  const padding = getPadding(prettyName, combinationsA)
  const combinationsB = combinationsA.map((combination) =>
    finalizeValue({ combination, name, prettyName, padding }),
  )
  return combinationsB
}

const prettifyCombinationStat = function ({
  name,
  prettyName,
  combination,
  combination: {
    stats,
    stats: { [name]: stat, loops, measureCost, repeatCost, repeat },
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
    repeat,
    measureCost,
    repeatCost,
  })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

// Add paddings and colors after stats have been prettified
// We pad after values length for each combination is known.
// We pad before adding colors because ANSI sequences makes padding harder.
const finalizeValue = function ({
  name,
  prettyName,
  combination,
  combination: {
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
  return { ...combination, stats: { ...stats, [prettyName]: statPrettyA } }
}

const finalizeItem = function ({ stat, statPretty, padding, name }) {
  const statPrettyA = padValue(statPretty, padding)
  const statPrettyB = addColors(stat, statPrettyA, name)
  return statPrettyB
}
