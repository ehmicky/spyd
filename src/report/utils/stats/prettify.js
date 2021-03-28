import { addSuffixColors, addDiffColors } from './colors.js'
import { addSign } from './sign.js'

// Serialize combination stats into a prettified string
export const prettifyCombinationStats = function ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  signed,
  scale,
  unit,
  decimals,
}) {
  const prettyName = `${name}${PRETTY_NAME_SUFFIX}`
  const statPretty = prettifyStat({
    stat,
    name,
    signed,
    scale,
    unit,
    decimals,
  })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

export const PRETTY_NAME_SUFFIX = 'Pretty'

const prettifyStat = function ({ stat, name, signed, scale, unit, decimals }) {
  if (shouldSkipStat(stat)) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      prettifyValue({ stat: statA, name, signed, scale, unit, decimals }),
    )
  }

  return prettifyValue({ stat, name, signed, scale, unit, decimals })
}

// Statistics are not shown if undefined (e.g. `diff` with no previous results,
// or not-measure-yet in preview
const shouldSkipStat = function (stat) {
  return stat === undefined
}

// Serialize a stat's value
const prettifyValue = function ({ stat, name, signed, scale, unit, decimals }) {
  const statPretty = addScaleUnit({ stat, scale, unit, decimals })
  const statPrettyA = addSign(statPretty, signed)
  const statPrettyB = addSuffixColors(statPrettyA)
  const statPrettyC = addDiffColors(stat, statPrettyB, name)
  return statPrettyC
}

// Scale, round, add decimals and add unit
const addScaleUnit = function ({ stat, scale, unit, decimals }) {
  const scaledStat = stat / scale
  const roundedStat = scaledStat.toFixed(decimals)
  return `${roundedStat}${unit}`
}
