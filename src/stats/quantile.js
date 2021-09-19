// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = function (
  array,
  length,
  { minIndex = 0, maxIndex = array.length - 1 } = {},
) {
  return Array.from({ length: length + 1 }, (value, index) =>
    getQuantile(array, index / length, { minIndex, maxIndex }),
  )
}

// Retrieve median of an array of floats.
// Array must be sorted.
export const getSortedMedian = function (array, { minIndex, maxIndex } = {}) {
  return getQuantile(array, MEDIAN_QUANTILE, { minIndex, maxIndex })
}

const MEDIAN_QUANTILE = 0.5

const getQuantile = function (
  array,
  percentage,
  { minIndex = 0, maxIndex = array.length - 1 },
) {
  const position = minIndex + (maxIndex - minIndex) * percentage

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (Math.ceil(position) - position) +
    array[Math.ceil(position)] * (position - Math.floor(position))
  )
}
