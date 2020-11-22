// Retrieve the maximum length of any measures for each stat
export const getPadding = function (prettyName, combinations) {
  const statLengths = combinations
    .flatMap(({ stats }) => stats[prettyName])
    .map(getLength)

  if (statLengths.length === 0) {
    return 0
  }

  return Math.max(...statLengths)
}

const getLength = function (statPretty) {
  return statPretty.length
}

// Pad `*.statsPretty` on the left so they vertically align.
// Right padding was already performed when setting the number of decimals.
export const padValue = function (statPretty, padding) {
  return statPretty.padStart(padding)
}
