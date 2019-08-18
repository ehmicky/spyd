import { findBenchmark } from '../save/find.js'

// Retrieve the index of the previous benchmark to compare/diff with
export const getDiffIndex = function(previous, diff) {
  if (diff === undefined || previous.length === 0) {
    return
  }

  return findBenchmark(previous, diff.queryType, diff.queryValue)
}

// Retrieve the difference of median compared with a previous benchmark
export const getDiff = function(previous, diffIndex, { median }) {
  if (diffIndex === undefined) {
    return
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const diffIteration = previous
    .slice()
    .reverse()
    .find(({ benchmark }) => benchmark <= diffIndex)

  if (diffIteration === undefined) {
    return
  }

  const {
    stats: { median: previousMedian },
  } = diffIteration

  if (previousMedian === 0) {
    return
  }

  return median / previousMedian - 1
}
