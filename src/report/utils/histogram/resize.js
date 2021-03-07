// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
// eslint-disable-next-line max-statements
export const resizeHistogram = function (counts, newSize) {
  const oldSize = counts.length
  const sums = []

  if (newSize === 0 || oldSize === 0) {
    return sums
  }

  // eslint-disable-next-line fp/no-let
  let previousInteger = 0
  // eslint-disable-next-line fp/no-let
  let previousFraction = 0
  const resizeRatio = oldSize / newSize

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 1; index < newSize + 1; index += 1) {
    const startIndex = resizeRatio * index
    const integer = Math.floor(startIndex)
    const fraction = startIndex - integer

    addSum(previousInteger, previousFraction, integer, fraction, counts, sums)

    // eslint-disable-next-line fp/no-mutation
    previousInteger = integer
    // eslint-disable-next-line fp/no-mutation
    previousFraction = fraction
  }

  return sums
}

const addSum = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
  counts,
  sums,
) {
  const sum =
    getStartSum(previousInteger, previousFraction, integer, fraction, counts) +
    getMiddleSum(previousInteger, integer, counts) +
    getEndSum(previousInteger, integer, fraction, counts)
  // eslint-disable-next-line fp/no-mutating-methods
  sums.push(sum)
}

const getStartSum = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
  counts,
) {
  return (
    counts[previousInteger] *
    ((previousInteger === integer ? fraction : 1) - previousFraction)
  )
}

const getMiddleSum = function (previousInteger, integer, counts) {
  // eslint-disable-next-line fp/no-let
  let middleSum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let index = previousInteger + 1; index < integer; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    middleSum += counts[index]
  }

  return middleSum
}

const getEndSum = function (previousInteger, integer, fraction, counts) {
  return fraction === 0 || previousInteger === integer
    ? 0
    : counts[integer] * fraction
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
