// Note that when `repeat > 1`, the distribution of the measured function will
// be modified by the looping process and transformed to a bell shape, even if
// if was not one. This means `percentiles`, `histogram`, `variance` and
// `deviation` will have a different meaning: they visualize the measurements of
// the function not function itself).
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
