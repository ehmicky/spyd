import now from 'precise-now'

// Measure an empty task
export const addEmptyMeasure = function (emptyMeasures) {
  if (emptyMeasures === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  emptyMeasures.push(getEmptyMeasure())
}

// We use a separate function from `getDuration()` because:
//  - this must only use the non-repeated part
//  - the normal measures loop would get de-optimized otherwise
const getEmptyMeasure = function () {
  return -now() + now()
}
