import { findBenchmark } from '../store/find.js'

// Retrieve the index of the previous benchmark to compare/diff with
export const getDiffIndex = function(previous, diff) {
  if (diff === undefined || isInitialDiff(previous, diff)) {
    return
  }

  return findBenchmark(previous, diff.queryType, diff.queryValue)
}

// We do not error when using the default `--diff` and no benchmarks have been
// saved yet
const isInitialDiff = function(previous, { queryType, queryValue }) {
  return queryType === 'count' && queryValue === 1 && previous.length === 0
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
