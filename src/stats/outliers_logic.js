import { getQuantiles } from './quantile.js'

// Compute the best percentage of outliers to remove.
// This tries to find the best percentage which:
//  - Minimizes the max-min difference, to increase precision
//  - Without removing too many outliers, to keep accuracy
// Computing it based on the measures distribution is much better than
// hardcoding specific outliers thresholds.
//  - For example, the threshold automatically adapts to the measures
//    distribution. Otherwise, the max-min range might flicker when the
//    threshold is close a big outlier.
// This is applied separately on max and min outliers.
export const getOutliersPercentages = function (measures) {
  const length = Math.ceil(1 / OUTLIERS_GRANULARITY)
  const minIndex = Math.floor(length * OUTLIERS_MAX)

  if (minIndex === 0) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const quantiles = getQuantiles(measures, length)

  // console.log(
  //   quantiles.map((number) => number.toFixed(3).padStart(10)).join('\n'),
  // )

  const outliersMin = getOutliersPercentage(quantiles, minIndex, length)
  const outliersMax = getOutliersPercentage(
    // eslint-disable-next-line fp/no-mutating-methods
    [...quantiles].reverse(),
    minIndex,
    length,
  )
  return { outliersMin, outliersMax }
}

// Maximum amount of outliers on each tail
const OUTLIERS_MAX = 0.5
// Minimum increment between two outliers percentages.
// For example, 1e-3 means the granularity is 0.1%.
// A higher value makes it slower to compute.
// A lower value makes the value less accurate.
const OUTLIERS_GRANULARITY = 1e-3

// Return outliers percentage based on a specific outlier quantile
const getOutliersPercentage = function (quantiles, minIndex, length) {
  // console.log('')
  // console.log(
  //   quantiles
  //     .slice(0, minIndex + 1)
  //     .map((number) => number.toFixed(3).padStart(10))
  //     .join('\n'),
  // )

  // eslint-disable-next-line fp/no-let
  let maxIndex = 0
  // eslint-disable-next-line fp/no-let
  let newMaxIndex = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // console.log('')
    // console.log(`${maxIndex} -> ${newMaxIndex}`)

    // eslint-disable-next-line fp/no-mutation
    maxIndex = newMaxIndex
    // eslint-disable-next-line fp/no-mutation
    newMaxIndex = findMaxIndex(quantiles, minIndex, maxIndex)
  } while (newMaxIndex !== undefined)

  // console.log(`Final: ${maxIndex} ${maxIndex / length}`)
  // console.log('')

  return maxIndex / length
}

// eslint-disable-next-line max-statements, complexity
const findMaxIndex = function (quantiles, minIndex, maxIndex) {
  const max = quantiles[maxIndex]
  const min = quantiles[minIndex]
  // console.log(max, min)

  if (max === min) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = maxIndex + 1; index < minIndex; index += 1) {
    const quantile = quantiles[index]

    // `max === quantile` happens when several consecutive quantiles have the
    // same value which happens when a specific measure is repeated many times.
    // `max < quantile` happens when the quantiles computation has rounding
    // errors leading some quantiles very close to each other (difference close
    // to `Number.EPSILON`) to be sorted in the wrong order.
    // eslint-disable-next-line max-depth
    if (max <= quantile) {
      return
    }

    const widthPercentage = (max - quantile) / (max - min)
    const quantilePercentage = (index - maxIndex) / (minIndex - maxIndex)
    const quantileRatio = getQuantileRatio(widthPercentage, quantilePercentage)
    // const line = [
    //   quantile,
    //   index,
    //   widthPercentage,
    //   quantilePercentage,
    //   quantileRatio,
    // ]
    //   .map((number) => number.toFixed(3).padStart(10))
    //   .join(' ')
    // console.log(line)

    // eslint-disable-next-line max-depth
    if (quantileRatio > OUTLIERS_THRESHOLD) {
      return index
    }
  }
}

const getQuantileRatio = function (widthPercentage, quantilePercentage) {
  return Math.log(1 - widthPercentage) / Math.log(1 - quantilePercentage)
}

// If the following amount of measures leads to >= 50% width reduction, they
// are considered outliers.
// A higher value is less accurate as more information is trimmed.
// A lower value is less precise as outliers will have a higher impact on the
// mean. It also results in poorer histograms.
const OUTLIERS_BASE_AMOUNT = 0.08
// Computes based on a 50% width reduction
const OUTLIERS_BASE_WIDTH = 0.5
const OUTLIERS_THRESHOLD = getQuantileRatio(
  OUTLIERS_BASE_WIDTH,
  OUTLIERS_BASE_AMOUNT,
)
