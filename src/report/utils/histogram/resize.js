// TODO: shortcuts for:
//  - counts.length % length === 0
//  - length % counts.length === 0
// eslint-disable-next-line max-statements, complexity
export const resizeHistogram = function (counts, newSize) {
  const oldSize = counts.length

  if (newSize === 0 || oldSize === 0) {
    return []
  }

  if (newSize === oldSize) {
    return [...counts]
  }

  // eslint-disable-next-line fp/no-let
  let previousInteger = 0
  // eslint-disable-next-line fp/no-let
  let previousFraction = 0
  const resizeRatio = oldSize / newSize

  // Using `newArray()` and a `for` loop is more efficient
  // eslint-disable-next-line unicorn/no-new-array
  const newHistogram = new Array(newSize)

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let newIndex = 0; newIndex < newSize; newIndex += 1) {
    const oldIndex = resizeRatio * (newIndex + 1)
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

const getSum = function (
  previousInteger,
  integer,
  previousFraction,
  fraction,
  counts,
) {
  return integer === previousInteger
    ? getSimpleSum(integer, previousFraction, fraction, counts)
    : getComplexSum(
        previousInteger,
        integer,
        previousFraction,
        fraction,
        counts,
      )
}

const getSimpleSum = function (integer, previousFraction, fraction, counts) {
  return counts[integer] * (fraction - previousFraction)
}

const getComplexSum = function (
  previousInteger,
  integer,
  previousFraction,
  fraction,
  counts,
) {
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

const exampleCountsA = [5, 10, 5, 10, 5, 10, 5, 10, 5]
console.log(resizeHistogram(exampleCountsA, 9))
console.log(resizeHistogram(exampleCountsA, 4))
console.log(resizeHistogram(exampleCountsA, 3))
console.log(resizeHistogram(exampleCountsA, 1))

const exampleCountsB = [5, 10, 5]
console.log(resizeHistogram(exampleCountsB, 6))
console.log(resizeHistogram(exampleCountsB, 5))
console.log(resizeHistogram(exampleCountsB, 2))

const exampleCountsC = [5, 10]
console.log(resizeHistogram(exampleCountsC, 2))
console.log(resizeHistogram(exampleCountsC, 3))

const exampleCountsD = [5]
console.log(resizeHistogram(exampleCountsD, 3))
