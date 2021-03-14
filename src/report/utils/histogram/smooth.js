export const smoothHistogram = function (counts, smoothPercentage) {
  const countsLength = counts.length

  const smoothSize = Math.max((countsLength * smoothPercentage - 1) / 2, 0)
  const fullSmoothSize = Math.floor(smoothSize)
  const partialSmoothSize = smoothSize - fullSmoothSize

  // eslint-disable-next-line unicorn/no-new-array
  const smoothedCounts = new Array(countsLength)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let countIndex = 0; countIndex < countsLength; countIndex += 1) {
    // eslint-disable-next-line fp/no-mutation
    smoothedCounts[countIndex] = getSmoothedCount(
      counts,
      countsLength,
      countIndex,
      fullSmoothSize,
      partialSmoothSize,
    )
  }

  return smoothedCounts
}

// eslint-disable-next-line max-statements
const getSmoothedCount = function (
  counts,
  countsLength,
  countIndex,
  fullSmoothSize,
  partialSmoothSize,
) {
  const startIndex = countIndex - fullSmoothSize - 1
  const endIndex = countIndex + fullSmoothSize + 1
  const startFullIndex = Math.max(startIndex + 1, 0)
  const endFullIndex = Math.min(endIndex - 1, countsLength - 1)

  let smoothedCount = 0
  let size = 0

  if (startIndex >= 0) {
    smoothedCount += counts[startIndex] * partialSmoothSize
    size += partialSmoothSize
  }

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = startFullIndex; index <= endFullIndex; index += 1) {
    smoothedCount += counts[index]
    size += 1
  }

  if (endIndex <= countsLength - 1) {
    smoothedCount += counts[endIndex] * partialSmoothSize
    size += partialSmoothSize
  }

  return smoothedCount / size
}

const histogramExampleA = []
console.log(smoothHistogram(histogramExampleA, 0.5))
const histogramExampleB = [5]
console.log(smoothHistogram(histogramExampleB, 0.5))
const histogramExampleC = [5, 10]
console.log(smoothHistogram(histogramExampleC, 0.5))
console.log(smoothHistogram(histogramExampleC, 0.75))
const histogramExampleD = [98, 10, 56, 12, 74, 65, 54, 10, 98, 98]
console.log(smoothHistogram(histogramExampleD, 1))
console.log(smoothHistogram(histogramExampleD, 0.4))
console.log(smoothHistogram(histogramExampleD, 0.35))
console.log(smoothHistogram(histogramExampleD, 0.2))
console.log(smoothHistogram(histogramExampleD, 0.05))
console.log(smoothHistogram(histogramExampleD, 0))
