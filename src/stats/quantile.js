// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = (
  array,
  quantilesCount,
  { minIndex = 0, maxIndex = array.length - 1 } = {},
) =>
  Array.from({ length: quantilesCount + 1 }, (value, index) =>
    getQuantile(array, index / quantilesCount, { minIndex, maxIndex }),
  )

// Retrieve median of an array of floats.
// Array must be sorted.
export const getSortedMedian = (array, { minIndex, maxIndex } = {}) =>
  getQuantile(array, MEDIAN_QUANTILE, { minIndex, maxIndex })

const MEDIAN_QUANTILE = 0.5

// This logic is avoiding floating rounding errors which could otherwise happen
// with consecutive identical measures, leading to a quantile having a slightly
// (Number.EPSILON) higher value than the previous one.
export const getQuantile = (
  array,
  percentage,
  { minIndex = 0, maxIndex = array.length - 1 },
) => {
  const position = minIndex + (maxIndex - minIndex) * percentage
  const lowerPosition = Math.floor(position)
  const higherPosition = Math.ceil(position)
  const lowerValue = array[lowerPosition]
  const higherValue = array[higherPosition]
  return lowerValue + (higherValue - lowerValue) * (position - lowerPosition)
}
