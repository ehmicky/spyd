// Create `stat.prettyPadded`, i.e. `stat.pretty` padded on the left so they
// vertically align.
// Right padding was already performed when setting the number of decimals.
export const addStatPadded = (combinations, name) => {
  const padding = getPadding(combinations, name)
  return combinations.map((combination) =>
    addItemsPadded({ name, combination, padding }),
  )
}

// Retrieve the maximum length of any measures for each stat
const getPadding = (combinations, name) => {
  const statLengths = combinations
    .flatMap(({ stats }) => stats[name])
    .filter(Boolean)
    .map(getLength)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const getLength = ({ pretty }) => pretty.length

const addItemsPadded = ({
  name,
  combination,
  combination: {
    stats,
    stats: { [name]: stat },
  },
  padding,
}) => {
  if (stat === undefined) {
    return combination
  }

  const statA = Array.isArray(stat)
    ? stat.map((singleStat) => addItemPadded(singleStat, padding))
    : addItemPadded(stat, padding)
  return { ...combination, stats: { ...stats, [name]: statA } }
}

const addItemPadded = (stat, padding) => {
  const prettyPadded = stat.pretty.padStart(padding)
  return { ...stat, prettyPadded }
}
