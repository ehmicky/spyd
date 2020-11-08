// Retrieve the maximum length of any measures for each stat
export const getPadding = function (name, iterations) {
  const statLengths = iterations
    .flatMap(({ stats }) => stats[`${name}Pretty`])
    .map(getLength)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const getLength = function (stat) {
  return stat.length
}

// Pad `*.statsPretty` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const padValue = function (stat, padding) {
  if (Array.isArray(stat)) {
    return stat.map((statA) => padItem(statA, padding))
  }

  return padItem(stat, padding)
}

const padItem = function (stat, padding) {
  return stat.padStart(padding)
}
