import mapObj from 'map-obj'

// Compute the horizontal position on the screen of each quantile
export const getPositions = function ({
  quantiles,
  minAll,
  maxAll,
  contentWidth,
}) {
  return mapObj(quantiles, (name, stat) =>
    getPosition({ name, stat, minAll, maxAll, contentWidth }),
  )
}

const getPosition = function ({
  name,
  stat: { raw, pretty, prettyColor },
  minAll,
  maxAll,
  contentWidth,
}) {
  const percentage = (raw - minAll) / (maxAll - minAll)
  const index = Math.min(
    Math.floor(percentage * contentWidth),
    contentWidth - 1,
  )
  return [name, { pretty, prettyColor, index }]
}
