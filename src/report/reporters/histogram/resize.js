// TODO: performance shortcuts for the following situations:
//  - newSize > oldSize:
//     - the loop in `getComplexSum()` is not needed
//     - the result of `getSimpleSum()` can be re-used for the next iteration,
//       unless `integer` changes
//     - if newSize % oldSize === 0:
//        - `getComplexSum()` not needed
//        - `fraction - previousFraction` always same, i.e. can simplify
//          `integer` and `fraction` computation
//  - newSize < oldSize:
//     - `getSimpleSum()` not needed
//     - if oldSize % newSize === 0, last part of `getComplexSum()` not needed
// eslint-disable-next-line max-statements, complexity
export const resizeHistogram = (counts, newSize) => {
  const oldSize = counts.length

  if (newSize === 0 || oldSize === 0) {
    return []
  }

  if (newSize === oldSize) {
    return [...counts]
  }

  if (oldSize === 1) {
    return [counts[0], ...new Array(newSize - 1).fill(0)]
  }

  // eslint-disable-next-line fp/no-let
  let previousInteger = 0
  // eslint-disable-next-line fp/no-let
  let previousFraction = 0

  // Using `new Array()` and a `for` loop is more efficient
  const newHistogram = new Array(newSize)

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let newIndex = 0; newIndex < newSize; newIndex += 1) {
    const oldIndex = oldSize * ((newIndex + 1) / newSize)
    const integer = Math.ceil(oldIndex - 1)
    const fraction = oldIndex - integer

    // eslint-disable-next-line fp/no-mutation
    newHistogram[newIndex] = getSum(
      previousInteger,
      integer,
      previousFraction,
      fraction,
      counts,
    )

    // eslint-disable-next-line fp/no-mutation
    previousInteger = integer
    // eslint-disable-next-line fp/no-mutation
    previousFraction = fraction
  }

  return newHistogram
}

const getSum = (
  previousInteger,
  integer,
  previousFraction,
  fraction,
  counts,
  // eslint-disable-next-line max-params
) =>
  integer === previousInteger
    ? getSimpleSum(integer, previousFraction, fraction, counts)
    : getComplexSum(
        previousInteger,
        integer,
        previousFraction,
        fraction,
        counts,
      )

// eslint-disable-next-line max-params
const getSimpleSum = (integer, previousFraction, fraction, counts) =>
  counts[integer] * (fraction - previousFraction)

const getComplexSum = (
  previousInteger,
  integer,
  previousFraction,
  fraction,
  counts,
  // eslint-disable-next-line max-params
) => {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = previousInteger + 1; index < integer; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += counts[index]
  }

  return (
    sum +
    counts[previousInteger] * (1 - previousFraction) +
    counts[integer] * fraction
  )
}
