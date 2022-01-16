import { mapValues } from '../../../utils/map.js'

// Compute the horizontal position on the screen of each quantile
export const getPositions = function ({
  combination: { quantiles },
  minAll,
  maxAll,
  contentWidth,
}) {
  return mapValues(quantiles, (stat) =>
    getPosition(stat, { minAll, maxAll, contentWidth }),
  )
}

const getPosition = function (
  { raw, pretty, prettyColor },
  { minAll, maxAll, contentWidth },
) {
  const index = getIndex({ raw, minAll, maxAll, contentWidth })
  return { pretty, prettyColor, index }
}

// Compute the horizontal position on the screen of a specific quantile
export const getIndex = function ({ raw, minAll, maxAll, contentWidth }) {
  const percentage = maxAll === minAll ? 0 : (raw - minAll) / (maxAll - minAll)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}
