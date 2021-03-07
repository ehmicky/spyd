// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
export const interpolateHistogram = function (counts, length) {
  const countsLength = counts.length

  if (length === 0 || countsLength === 0) {
    return []
  }

  return getIndexes(length + 1).reduce(
    getParts.bind(undefined, counts, countsLength, length),
    [[]],
  )[0]
}

const getIndexes = function (length) {
  return Array.from({ length }, getIndex)
}

const getIndex = function (_, index) {
  return index
}

const getParts = function (
  counts,
  countsLength,
  length,
  [parts, previousInteger, previousFraction],
  index,
) {
  const [integer, fraction] = getChunk(countsLength, length, index)

  if (previousInteger === undefined) {
    return [parts, integer, fraction]
  }

  const sum =
    getStartPart(previousInteger, previousFraction, integer, fraction, counts) +
    getMiddlePart(previousInteger, integer, counts) +
    getEndPart(previousInteger, integer, fraction, counts)
  const partsA = [...parts, sum]
  return [partsA, integer, fraction]
}

const getChunk = function (countsLength, length, index) {
  const startIndex = (countsLength * index) / length
  const integer = Math.floor(startIndex)
  const fraction = startIndex - integer
  return [integer, fraction]
}

const getStartPart = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
  counts,
) {
  const startFraction = previousInteger === integer ? fraction : 1
  return counts[previousInteger] * (startFraction - previousFraction)
}

const getMiddlePart = function (previousInteger, integer, counts) {
  if (previousInteger + 2 > integer) {
    return 0
  }

  return getIndexes(integer - previousInteger - 1).reduce(
    (sum, index) => sum + counts[index + previousInteger + 1],
    0,
  )
}

const getEndPart = function (previousInteger, integer, fraction, counts) {
  if (fraction === 0 || previousInteger === integer) {
    return 0
  }

  return counts[integer] * fraction
}

const exampleCountsA = [5, 10, 5, 10, 5, 10, 5, 10, 5]
console.log(interpolateHistogram(exampleCountsA, 9))
console.log(interpolateHistogram(exampleCountsA, 4))
console.log(interpolateHistogram(exampleCountsA, 3))
console.log(interpolateHistogram(exampleCountsA, 1))

const exampleCountsB = [5, 10, 5]
console.log(interpolateHistogram(exampleCountsB, 6))
console.log(interpolateHistogram(exampleCountsB, 5))
console.log(interpolateHistogram(exampleCountsB, 2))

const exampleCountsC = [5, 10]
console.log(interpolateHistogram(exampleCountsC, 2))
console.log(interpolateHistogram(exampleCountsC, 3))

const exampleCountsD = [5]
console.log(interpolateHistogram(exampleCountsD, 3))
