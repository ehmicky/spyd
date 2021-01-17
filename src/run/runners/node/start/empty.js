import now from 'precise-now'

// Computes the duration to retrieve timestamps.
// This is used to compute `measureCost` and `resolution`, which are used for
// `repeat`.
export const getEmptyMeasures = function (emptyLength) {
  return Array.from({ length: emptyLength }, getEmptyMeasure)
}

// We use a separate function from `getDuration()` because this must only use
// the non-repeated part
const getEmptyMeasure = function () {
  return -now() + now()
}
