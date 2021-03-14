export const smoothHistogram = function (counts, smoothPercentage) {
  const countsLength = counts.length

  const smoothSize = Math.max(countsLength * smoothPercentage, 1)
  const unroundedSmoothSize = (smoothSize - 1) / 2
  const fullSmoothSize = Math.ceil(unroundedSmoothSize)
  const partialSmoothSize = unroundedSmoothSize - fullSmoothSize + 1

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
  const startIndex = countIndex - fullSmoothSize
  const endIndex = countIndex + fullSmoothSize
  const startFullIndex = Math.max(startIndex + 1, 0)
  const endFullIndex = Math.min(endIndex - 1, countsLength - 1)

  const smoothedCount = []

  if (startIndex >= 0) {
    // eslint-disable-next-line fp/no-mutating-methods
    smoothedCount.push([startIndex, partialSmoothSize])
  }

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = startFullIndex; index <= endFullIndex; index += 1) {
    // eslint-disable-next-line fp/no-mutating-methods
    smoothedCount.push([index, 1])
  }

  if (endIndex <= countsLength - 1) {
    // eslint-disable-next-line fp/no-mutating-methods
    smoothedCount.push([endIndex, partialSmoothSize])
  }

  return smoothedCount
}

// const histogramExampleA = []
// const histogramExampleB = [5]
// const histogramExampleC = [5, 10]
const histogramExampleD = [5, 10, 56, 12, 74, 65, 54, 10, 98, 98]
console.log(smoothHistogram(histogramExampleD, 0.4))
