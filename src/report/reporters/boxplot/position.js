import mapObj from 'map-obj'

// Compute the horizontal position on the screen of each quantile
export const getPositions = function ({
  quantiles,
  minAll,
  maxAll,
  contentWidth,
}) {
  return mapObj(quantiles, (name, stat) => [
    name,
    getPosition(stat, { minAll, maxAll, contentWidth }),
  ])
}

const getPosition = function (
  { raw, pretty, prettyColor },
  { minAll, maxAll, contentWidth },
) {
  const index = getIndex({ raw, minAll, maxAll, contentWidth })
  return { pretty, prettyColor, index }
}

const getIndex = function ({ raw, minAll, maxAll, contentWidth }) {
  const percentage = maxAll === minAll ? 0 : (raw - minAll) / (maxAll - minAll)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}
