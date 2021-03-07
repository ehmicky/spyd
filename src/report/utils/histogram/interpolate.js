// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
export const interpolateHistogram = function (counts, length) {
  const countsLength = counts.length

  if (length === 0 || countsLength === 0) {
    return []
  }

  return Array.from({ length: length + 1 }, (_, index) =>
    getChunk(countsLength, length, index),
  )
    .map(getParts)
    .filter(Boolean)
    .map((parts) => getBin(parts, counts))
}

const getChunk = function (countsLength, length, index) {
  const startIndex = (countsLength * index) / length
  const integer = Math.floor(startIndex)
  const fraction = startIndex - integer
  return [integer, fraction]
}

const getParts = function ([integer, fraction], chunkIndex, chunks) {
  if (chunkIndex === 0) {
    return
  }

  const [previousInteger, previousFraction] = chunks[chunkIndex - 1]
  const startPart = getStartPart(
    previousInteger,
    previousFraction,
    integer,
    fraction,
  )
  const middlePart = getMiddlePart(previousInteger, previousFraction, integer)
  const endPart = getEndPart(previousInteger, integer, fraction)
  const parts = [startPart, ...middlePart, endPart].filter(Boolean)
  return parts
}

const getStartPart = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
) {
  if (previousInteger === integer) {
    return [previousInteger, fraction - previousFraction]
  }

  return [previousInteger, 1 - previousFraction]
}

const getMiddlePart = function (previousInteger, previousFraction, integer) {
  const startInteger = previousInteger + 1
  const endInteger = integer - 1

  if (startInteger > endInteger) {
    return []
  }

  const middleLength = endInteger - startInteger + 1
  return Array.from({ length: middleLength }, (_, index) => [
    index + startInteger,
    1,
  ])
}

const getEndPart = function (previousInteger, integer, fraction) {
  if (fraction === 0 || previousInteger === integer) {
    return
  }

  return [integer, fraction]
}

const getBin = function (parts, counts) {
  return parts.map((part) => getBinPart(part, counts)).reduce(getSum, 0)
}

const getBinPart = function ([countIndex, percentage], counts) {
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
