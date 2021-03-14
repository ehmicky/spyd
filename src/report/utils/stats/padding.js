import stringWidth from 'string-width'

import { PRETTY_NAME_SUFFIX } from './prettify.js'

// Pad `*.statsPadded` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const padCombinations = function (combinations, name) {
  const prettyName = `${name}${PRETTY_NAME_SUFFIX}`
  const padding = getPadding(prettyName, combinations)
  return combinations.map((combination) =>
    padCombination({ name, prettyName, combination, padding }),
  )
}

// Retrieve the maximum length of any measures for each stat
const getPadding = function (prettyName, combinations) {
  const statLengths = combinations
    .flatMap(({ stats }) => stats[prettyName])
    .map(stringWidth)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const padCombination = function ({
  name,
  prettyName,
  combination,
  combination: {
    stats,
    stats: { [prettyName]: statPretty },
  },
  padding,
}) {
  const paddedName = `${name}${PADDED_NAME_SUFFIX}`
  const statPadded = Array.isArray(statPretty)
    ? statPretty.map((item) => padStat(item, padding))
    : padStat(statPretty, padding)
  return { ...combination, stats: { ...stats, [paddedName]: statPadded } }
}

const PADDED_NAME_SUFFIX = 'Padded'

const padStat = function (statPretty, padding) {
  const length = stringWidth(statPretty)
  const spaces = ' '.repeat(Math.max(padding - length, 0))
  return `${spaces}${statPretty}`
}
