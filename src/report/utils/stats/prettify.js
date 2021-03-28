import { addSuffixColors, addDiffColors } from './colors.js'
import { addSign } from './sign.js'
import { addScaleUnit } from './unit.js'

// Serialize combination stats into a prettified string
export const prettifyCombinationStats = function ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  kind,
  signed,
  scale,
  decimals,
}) {
  const prettyName = `${name}${PRETTY_NAME_SUFFIX}`
  const statPretty = prettifyStat({ stat, name, kind, signed, scale, decimals })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

export const PRETTY_NAME_SUFFIX = 'Pretty'

const prettifyStat = function ({ stat, name, kind, signed, scale, decimals }) {
  if (shouldSkipStat(stat)) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      prettifyValue({ stat: statA, name, kind, signed, scale, decimals }),
    )
  }

  return prettifyValue({ stat, name, kind, signed, scale, decimals })
}

// Statistics are not shown if undefined (e.g. `diff` with no previous results,
// or not-measure-yet in preview
const shouldSkipStat = function (stat) {
  return stat === undefined
}

// Serialize a stat's value
const prettifyValue = function ({ stat, name, kind, signed, scale, decimals }) {
  const statPretty = addScaleUnit({ stat, kind, scale, decimals })
  const statPrettyA = addSign(statPretty, signed)
  const statPrettyB = addSuffixColors(statPrettyA)
  const statPrettyC = addDiffColors(stat, statPrettyB, name)
  return statPrettyC
}
