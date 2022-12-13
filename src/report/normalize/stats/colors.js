import {
  badColor,
  badHighlightColor,
  goodColor,
  goodHighlightColor,
  suffixColor,
} from '../../utils/colors.js'

// Add `stat.prettyColor` and `stat.prettyPaddedColor`
export const addStatColor = ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
}) => {
  if (stat === undefined) {
    return combination
  }

  const statA = Array.isArray(stat)
    ? stat.map((singleStat) => addItemsColor({ stat: singleStat, name, stats }))
    : addItemsColor({ stat, name, stats })
  return { ...combination, stats: { ...stats, [name]: statA } }
}

const addItemsColor = ({
  stat,
  stat: { raw, pretty, prettyPadded },
  name,
  stats,
}) => {
  const prettyColor = addItemColor(pretty, { raw, name, stats })
  const prettyPaddedColor = addItemColor(prettyPadded, { raw, name, stats })
  return { ...stat, prettyColor, prettyPaddedColor }
}

const addItemColor = (pretty, { raw, name, stats }) => {
  if (pretty === '') {
    return ''
  }

  const prettyA = addSuffixColors(pretty)
  const prettyB = addSpecificColors(prettyA, { raw, name, stats })
  return prettyB
}

// Add colors to suffixes (units, exponents, %) so they are easy to distinguish
// from the number they are attached to.
const addSuffixColors = (pretty) => {
  const [, number, suffix] = SUFFIX_REGEXP.exec(pretty)
  return `${number}${suffixColor(suffix)}`
}

const SUFFIX_REGEXP = /^([^a-z%]*)(.*)$/u

// Add stat-specific colors, e.g. on `diff`
const addSpecificColors = (pretty, { raw, name, stats }) => {
  if (raw === undefined) {
    return pretty
  }

  const getColor = STAT_COLORS[name]

  if (getColor === undefined) {
    return pretty
  }

  const color = getColor(raw, stats)

  if (color === undefined) {
    return pretty
  }

  return color(pretty)
}

const getDiffColor = (diff, { diffPrecise, diffLimit }) => {
  if (!diffPrecise) {
    return
  }

  const hasDiffLimit = diffLimit !== undefined
  return diff > 0
    ? getBadDiffColor(hasDiffLimit)
    : getGoodDiffColor(hasDiffLimit)
}

const getBadDiffColor = (hasDiffLimit) =>
  hasDiffLimit ? badHighlightColor : badColor

const getGoodDiffColor = (hasDiffLimit) =>
  hasDiffLimit ? goodHighlightColor : goodColor

const STAT_COLORS = {
  diff: getDiffColor,
}
