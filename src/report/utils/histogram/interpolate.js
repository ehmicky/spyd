export const interpolateHistogram = function (counts, length) {
  return Array.from({ length: length + 1 }, (_, index) =>
    getChunk(counts, length, index),
  )
    .map(interpolateBin)
    .filter(Boolean)
}

const getChunk = function (counts, length, index) {
  const startIndex = (counts.length * index) / length
  const integer = Math.floor(startIndex)
  const fraction = startIndex - integer
  return [integer, fraction]
}

const interpolateBin = function ([integer, fraction], chunkIndex, chunks) {
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

  const min = parts[0][0] + parts[0][1]
  const max = parts[parts.length - 1][0] + parts[parts.length - 1][2]
  const sumA = parts.reduce((sum, [, start, end]) => sum + end - start, 0)
  return [...parts, { min, max, sumA }]
}

const getStartPart = function (
  previousInteger,
  previousFraction,
  integer,
  fraction,
) {
  if (previousInteger === integer) {
    return [previousInteger, previousFraction, fraction]
  }

  return [previousInteger, previousFraction, 1]
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
    0,
    1,
  ])
}

const getEndPart = function (previousInteger, integer, fraction) {
  if (fraction === 0 || previousInteger === integer) {
    return
  }

  return [integer, 0, fraction]
}

// const exampleCountsA = [5, 10, 5, 10, 5, 10, 5, 10, 5]
// console.log(interpolateHistogram(exampleCountsA, 9))
// console.log(interpolateHistogram(exampleCountsA, 4))
// console.log(interpolateHistogram(exampleCountsA, 3))
// console.log(interpolateHistogram(exampleCountsA, 1))

const exampleCountsB = [5, 10, 5]
console.log(interpolateHistogram(exampleCountsB, 5))
