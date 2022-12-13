import { mapValues } from '../../../utils/map.js'

// Compute the horizontal position on the screen of each quantile
export const getPositions = ({
  combination: { quantiles },
  minAll,
  maxAll,
  contentWidth,
}) =>
  mapValues(quantiles, (stat) =>
    getPosition(stat, { minAll, maxAll, contentWidth }),
  )

const getPosition = (
  { raw, pretty, prettyColor },
  { minAll, maxAll, contentWidth },
) => {
  const index = getIndex({ raw, minAll, maxAll, contentWidth })
  return { pretty, prettyColor, index }
}

// Compute the horizontal position on the screen of a specific quantile
export const getIndex = ({ raw, minAll, maxAll, contentWidth }) => {
  const percentage = maxAll === minAll ? 0 : (raw - minAll) / (maxAll - minAll)
  return Math.min(Math.floor(percentage * contentWidth), contentWidth - 1)
}
