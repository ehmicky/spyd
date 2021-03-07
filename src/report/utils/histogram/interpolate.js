// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
export const interpolateHistogram = function (counts, length) {
  const countsLength = counts.length

  if (length === 0 || countsLength === 0) {
    return []
  }

  return Array.from({ length: length + 1 }, getIndex).reduce(
    getParts.bind(undefined, counts, countsLength, length),
    [[]],
  )[0]
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
  if (previousInteger === integer) {
    return getBinPart(previousInteger, fraction - previousFraction, counts)
  }

  return getBinPart(previousInteger, 1 - previousFraction, counts)
}

const getMiddlePart = function (previousInteger, integer, counts) {
  const startInteger = previousInteger + 1
  const endInteger = integer - 1

  if (startInteger > endInteger) {
    return 0
  }

  const middleLength = endInteger - startInteger + 1
  return Array.from({ length: middleLength }, (_, index) =>
    getBinPart(index + startInteger, 1, counts),
  ).reduce(getSum, 0)
}

const getEndPart = function (previousInteger, integer, fraction, counts) {
  if (fraction === 0 || previousInteger === integer) {
    return 0
  }

  return getBinPart(integer, fraction, counts)
}

const getBinPart = function (countIndex, percentage, counts) {
  return counts[countIndex] * percentage
}

const getSum = function (sum, binPart) {
  return sum + binPart
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
