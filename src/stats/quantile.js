// Retrieve quantiles of an array of floats.
// Array must be sorted and not empty.
export const getQuantiles = function (array, length) {
  return Array.from({ length: length + 1 }, (value, index) =>
    getQuantile(array, index / length),
  )
}

export const getQuantile = function (array, percentage) {
  const position = (array.length - 1) * percentage

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (Math.ceil(position) - position) +
    array[Math.ceil(position)] * (position - Math.floor(position))
  )
}

// Retrieve median of an array of floats.
// Array must be sorted.
export const getSortedMedian = function (array) {
  return getQuantile(array, MEDIAN_QUANTILE)
}

const MEDIAN_QUANTILE = 0.5
