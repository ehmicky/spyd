// Create `stat.prettyPadded`, i.e. `stat.pretty` padded on the left so they
// vertically align.
// Right padding was already performed when setting the number of decimals.
export const addStatPadded = function (combinations, name) {
  const padding = getPadding(combinations, name)
  return combinations.map((combination) =>
    addItemsPadded({ name, combination, padding }),
  )
}

// Retrieve the maximum length of any measures for each stat
const getPadding = function (combinations, name) {
  const statLengths = combinations
    .flatMap(({ stats }) => stats[name].pretty)
    .map(getLength)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const getLength = function ({ length }) {
  return length
}

const addItemsPadded = function ({
  name,
  combination,
  combination: {
    stats,
    stats: {
      [name]: stat,
      [name]: { pretty },
    },
  },
  padding,
}) {
  const prettyPadded = Array.isArray(pretty)
    ? pretty.map((item) => item.padStart(padding))
    : pretty.padStart(padding)
  return {
    ...combination,
    stats: { ...stats, [name]: { ...stat, prettyPadded } },
  }
}
