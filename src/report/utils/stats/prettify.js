import { addSuffixColors, addDiffColors } from './colors.js'
import { serializeValue } from './serialize.js'

// Serialize combination stats into a prettified string
export const prettifyCombinationStats = function ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  kind,
  scale,
  decimals,
}) {
  const prettyName = `${name}${PRETTY_NAME_SUFFIX}`
  const statPretty = prettifyStat({ stat, name, kind, scale, decimals })
  return { ...combination, stats: { ...stats, [prettyName]: statPretty } }
}

export const PRETTY_NAME_SUFFIX = 'Pretty'

const prettifyStat = function ({ stat, name, kind, scale, decimals }) {
  if (shouldSkipStat(stat)) {
    return ''
  }

  if (Array.isArray(stat)) {
    return stat.map((statA) =>
      prettifyValue({ stat: statA, name, kind, scale, decimals }),
    )
  }

  return prettifyValue({ stat, name, kind, scale, decimals })
}

// Statistics are not shown if undefined (e.g. `diff` with no previous results,
// or not-measure-yet in preview
const shouldSkipStat = function (stat) {
  return stat === undefined
}

// Serialize a stat's value
const prettifyValue = function ({ stat, name, kind, scale, decimals }) {
  const statPretty = serializeValue({ stat, kind, scale, decimals })
  const statPrettyA = addSuffixColors(statPretty)
  const statPrettyB = addDiffColors(stat, statPrettyA, name)
  return statPrettyB
}
