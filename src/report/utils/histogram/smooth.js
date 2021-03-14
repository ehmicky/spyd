// Smoothes histogram. Reasons:
//  - When the sample size is low, each bucket will have small increase|decrease
//    compared to when the sample size is higher. Those creates bumpy edges
//    that are not statically relevant and visually distracting.
//  - Those bumps vary greatly over time, creating some vertical shakiness on
//    each bucket.
//  - This also make the mode shake. Since the mode is used to scale the whole
//    graph, this creates some additional (but separate) vertical shakiness on
//    the whole graph.
export const smoothHistogram = function (counts, smoothPercentage) {
  const countsLength = counts.length

  const totalSmooth = Math.max((countsLength * smoothPercentage - 1) / 2, 0)
  const fullSmooth = Math.floor(totalSmooth)
  const partialSmooth = totalSmooth - fullSmooth

  // eslint-disable-next-line unicorn/no-new-array
  const smoothedCounts = new Array(countsLength)

  // eslint-disable-next-line fp/no-loops, fp/no-mutation, fp/no-let
  for (let countIndex = 0; countIndex < countsLength; countIndex += 1) {
    // eslint-disable-next-line fp/no-mutation
    smoothedCounts[countIndex] = getSmoothedCount(
      counts,
      countsLength,
      countIndex,
      fullSmooth,
      partialSmooth,
    )
  }

  return smoothedCounts
}

// eslint-disable-next-line max-params
const getSmoothedCount = function (
  counts,
  countsLength,
  countIndex,
  fullSmooth,
  partialSmooth,
) {
  const partialStart = countIndex - fullSmooth - 1
  const partialEnd = countIndex + fullSmooth + 1
  const fullStart = Math.max(partialStart + 1, 0)
  const fullEnd = Math.min(partialEnd - 1, countsLength - 1)

  const hasPartialStart = partialStart >= 0
  const hasPartialEnd = partialEnd <= countsLength - 1

  const weight = getWeight(
    partialSmooth,
    fullStart,
    fullEnd,
    hasPartialStart,
    hasPartialEnd,
  )
  const partialWeight = weight / partialSmooth

  return (
    (hasPartialStart ? counts[partialStart] / partialWeight : 0) +
    getSum(counts, fullStart, fullEnd) / weight +
    (hasPartialEnd ? counts[partialEnd] / partialWeight : 0)
  )
}

// eslint-disable-next-line max-params
const getWeight = function (
  partialSmooth,
  fullStart,
  fullEnd,
  hasPartialStart,
  hasPartialEnd,
) {
  const partialCounts = (hasPartialStart ? 1 : 0) + (hasPartialEnd ? 1 : 0)
  const fullCounts = fullEnd - fullStart
  return 1 + fullCounts + partialCounts * partialSmooth
}

const getSum = function (array, start, end) {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = start; index <= end; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += array[index]
  }

  return sum
}
