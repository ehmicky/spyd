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
  const length = OUTLIERS_GRANULARITY
  const medianIndex = Math.floor(length * OUTLIERS_MAX)

  if (medianIndex === 0) {
    return { outliersMin: 0, outliersMax: 0 }
  }

  const quantiles = getQuantiles(measures, length)

  // console.log(
  //   quantiles.map((number) => number.toFixed(3).padStart(10)).join('\n'),
  // )

  const outliersMin = getOutliersPercentage(quantiles, medianIndex, length)
  const outliersMax = getOutliersPercentage(
    // eslint-disable-next-line fp/no-mutating-methods
    [...quantiles].reverse(),
    medianIndex,
    length,
  )
  return { outliersMin, outliersMax }
}

// Maximum amount of outliers on each tail
const OUTLIERS_MAX = 0.25
// Granularity of the outliers percentage.
// For example, 1e3 means the granularity is 0.1%.
// A higher value makes it slower to compute.
// A lower value makes the value less accurate.
const OUTLIERS_GRANULARITY = 1e3

// Return outliers percentage based on a specific outlier quantile
const getOutliersPercentage = function (quantiles, medianIndex, length) {
  // console.log('')
  // console.log(
  //   quantiles
  //     .slice(0, medianIndex + 1)
  //     .map((number) => number.toFixed(3).padStart(10))
  //     .join('\n'),
  // )

  // eslint-disable-next-line fp/no-let, init-declarations
  let quantileIndex
  // eslint-disable-next-line fp/no-let
  let newQuantileIndex = 0

  // eslint-disable-next-line fp/no-loops
  do {
    // console.log('')
    // console.log(`${quantileIndex} -> ${newQuantileIndex}`)

    // eslint-disable-next-line fp/no-mutation
    quantileIndex = newQuantileIndex
    // eslint-disable-next-line fp/no-mutation
    newQuantileIndex = findQuantileIndex(quantiles, medianIndex, quantileIndex)
  } while (newQuantileIndex !== undefined)

  // console.log(`Final: ${quantileIndex} ${quantileIndex / length}`)
  // console.log('')

  return quantileIndex / length
}

// eslint-disable-next-line max-statements, complexity
const findQuantileIndex = function (quantiles, medianIndex, quantileIndex) {
  const max = quantiles[quantileIndex]
  const median = quantiles[medianIndex]
  // console.log(max, median)

  if (max === median) {
    return
  }

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = quantileIndex + 1; index < medianIndex; index += 1) {
    const quantile = quantiles[index]
    const widthPercentage = (quantile - median) / (max - median)

    // The quantiles computation can have rounding errors leading some quantiles
    // very close to each other (difference close to `Number.EPSILON`) to be
    // sorted in the wrong order. This can lead to negative `quantile - median`
    // eslint-disable-next-line max-depth
    if (widthPercentage <= 0) {
      return
    }

    const quantilePercentage =
      (index - quantileIndex) / (medianIndex - quantileIndex)
    const quantileRatio = -Math.log(widthPercentage) / quantilePercentage
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

// How much width should a 1% quantile contain to be considered an outlier
// A higher value is less accurate as more information is trimmed.
// A lower value is less precise as outliers will have a higher impact on the
// mean. It also results in poorer histograms.
const OUTLIERS_1P_WIDTH = 0.08
// Computes based on a 1% quantile
const OUTLIERS_1P = 0.01
const OUTLIERS_THRESHOLD = -Math.log(1 - OUTLIERS_1P_WIDTH) / OUTLIERS_1P