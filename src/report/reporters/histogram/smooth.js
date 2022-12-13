// Smoothes histogram. Reasons:
//  - When the sample size is low, each bucket will have small increase|decrease
//    compared to when the sample size is higher. Those creates bumpy edges
//    that are not statically relevant and visually distracting.
//  - Those bumps vary greatly over time, creating some vertical shakiness on
//    each bucket.
//  - This also make the mode shake. Since the mode is used to scale the whole
//    graph, this creates some additional (but separate) vertical shakiness on
//    the whole graph.
export const smoothHistogram = (counts, smoothPercentage) => {
  const weight = Math.max(counts.length * smoothPercentage, 1)
  const totalSmooth = (weight - 1) / 2
  const fullSmooth = Math.floor(totalSmooth)
  const partialSmooth = totalSmooth - fullSmooth

  return Array.from({ length: counts.length }, (_, countIndex) =>
    getSmoothedCount(counts, countIndex, fullSmooth, partialSmooth, weight),
  )
}

const getSmoothedCount = (
  counts,
  countIndex,
  fullSmooth,
  partialSmooth,
  weight,
  // eslint-disable-next-line max-params
) => {
  const start = countIndex - fullSmooth - 1
  const end = countIndex + fullSmooth + 1

  return (
    (getPartialCounts(counts, start, end, partialSmooth) +
      getFullCounts(counts, start, end)) /
    weight
  )
}

// eslint-disable-next-line max-params
const getPartialCounts = (counts, start, end, partialSmooth) =>
  (getCount(counts, start) + getCount(counts, end)) * partialSmooth

const getFullCounts = (counts, start, end) => {
  // eslint-disable-next-line fp/no-let
  let sum = 0

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = start + 1; index < end; index += 1) {
    // eslint-disable-next-line fp/no-mutation
    sum += getCount(counts, index)
  }

  return sum
}

// For the counts of both ends of the histogram, we extrapolate additional
// counts beyond those ends. This keeps the current slope. Otherwise, the ends
// would always look flat.
// We do this extrapolation by mirroring the counts near the end, but in the
// opposite direction, using the end count as pivot.
const getCount = (counts, index) => {
  const maxIndex = counts.length - 1

  if (index < MIN_INDEX) {
    return getOppositeCount(
      counts,
      MIN_INDEX,
      Math.min(MIN_INDEX - index, maxIndex),
    )
  }

  if (index > maxIndex) {
    return getOppositeCount(
      counts,
      maxIndex,
      Math.max(maxIndex * 2 - index, MIN_INDEX),
    )
  }

  return counts[index]
}

const MIN_INDEX = 0

const getOppositeCount = (counts, pivotIndex, oppositeIndex) =>
  2 * counts[pivotIndex] - counts[oppositeIndex]
