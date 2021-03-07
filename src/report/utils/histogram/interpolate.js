// TODO: shortcuts for:
//  - counts.length === length
//  - counts.length % length === 0
//  - length % counts.length === 0
export const interpolateHistogram = function (counts, length) {
  const countsLength = counts.length

  if (length === 0 || countsLength === 0) {
    return []
  }

  return Array.from({ length: length + 1 }, getIndex)
    .map((index) => getChunk(countsLength, length, index))
    .reduce(getParts, [[]])[0]
    .map((parts) => getBin(parts, counts))
}

const getIndex = function (_, index) {
  return index
}

const getChunk = function (countsLength, length, index) {
  const startIndex = (countsLength * index) / length
  const integer = Math.floor(startIndex)
  const fraction = startIndex - integer
  return [integer, fraction]
}

const getParts = function (
  [parts, previousInteger, previousFraction],
  [integer, fraction],
) {
  if (previousInteger === undefined) {
    return [parts, integer, fraction]
  }

  const startPart = getStartPart(
    previousInteger,
    previousFraction,
    integer,
    fraction,
  )
  const middlePart = getMiddlePart(previousInteger, integer)
  const endPart = getEndPart(previousInteger, integer, fraction)
  const partsA = [...parts, [startPart, ...middlePart, endPart].filter(Boolean)]
  return [partsA, integer, fraction]
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

const getMiddlePart = function (previousInteger, integer) {
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
