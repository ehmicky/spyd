// Retrieve percentiles of an array of floats.
// Array must be sorted.
// Percentiles are `undefined` when array is empty.
export const getPercentiles = function(array) {
  // eslint-disable-next-line no-magic-numbers
  return getQuantiles(array, 1e2)
}

const getQuantiles = function(array, length) {
  return Array.from({ length }, (value, index) =>
    getQuantile(array, length, index),
  )
}

const getQuantile = function(array, length, index) {
  const position = ((array.length - 1) * index) / (length - 1)

  if (Number.isInteger(position)) {
    return array[position]
  }

  return (
    array[Math.floor(position)] * (position - Math.floor(position)) +
    array[Math.ceil(position)] * (Math.ceil(position) - position)
  )
}
