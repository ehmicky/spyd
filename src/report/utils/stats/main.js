import { addSuffixColors, addDiffColors } from './colors.js'
import { getStatsDecimals } from './decimals.js'
import { STAT_KINDS } from './kinds.js'
import { getPadding, padValue } from './padding.js'
import { getScale } from './scale.js'
import { serializeStat } from './serialize.js'

// Add `combination.stats.*Pretty` which is like `combination.stats.*` but
// serialized and CLI-reporter-friendly. It adds time units, rounding, padding
// and ensures proper vertical alignment.
export const prettifyStats = function (combinations) {
  return STAT_KINDS.reduce(prettifyCombinationsStat, combinations)
}

const prettifyCombinationsStat = function (combinations, { name, kind }) {
  const prettyName = `${name}Pretty`
  const paddedName = `${name}Padded`
  const scale = getScale(combinations, name, kind)
  const decimals = getStatsDecimals(combinations, name, scale)
  const combinationsA = combinations.map((combination) =>
    prettifyCombinationStat({
      combination,
      name,
      prettyName,
      kind,
      scale,
      decimals,
    }),
  )
  const padding = getPadding(prettyName, combinationsA)
  const combinationsB = combinationsA.map((combination) =>
    finalizeValue({ combination, name, prettyName, paddedName, padding }),
  )
  return combinationsB
}

const prettifyCombinationStat = function ({
  name,
  prettyName,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  kind,
  scale,
  decimals,
}) {
  const statPretty = serializeStat({ stat, kind, scale, decimals })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

// Add paddings and colors after stats have been prettified
// We pad after values length for each combination is known.
// We pad before adding colors because ANSI sequences makes padding harder.
const finalizeValue = function ({
  name,
  prettyName,
  paddedName,
  combination,
  combination: {
    stats,
    stats: { [name]: stat, [prettyName]: statPretty },
  },
  padding,
}) {
  const { statPretty: statPrettyA, statPadded } = finalizeStat({
    stat,
    statPretty,
    name,
    padding,
  })
  return {
    ...combination,
    stats: { ...stats, [prettyName]: statPrettyA, [paddedName]: statPadded },
  }
}

const finalizeStat = function ({ stat, statPretty, name, padding }) {
  if (!Array.isArray(stat)) {
    const singleStatPretty = finalizeItem(stat, statPretty, name)
    const singleStatPadded = padValue(singleStatPretty, padding)
    return { statPretty: singleStatPretty, statPadded: singleStatPadded }
  }

  const statPrettyA = stat.map((item, index) =>
    finalizeItem(item, statPretty[index], name),
  )
  const statPadded = statPrettyA.map((item) => padValue(item, padding))
  return { statPretty: statPrettyA, statPadded }
}

const finalizeItem = function (stat, statPretty, name) {
  const statPrettyA = addSuffixColors(statPretty)
  const statPrettyB = addDiffColors(stat, statPrettyA, name)
  return statPrettyB
}
