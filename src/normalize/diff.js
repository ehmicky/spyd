import { find } from '../store/delta/find.js'

// Retrieve the index of the previous result to compare/diff with
export const getDiffIndex = function (results, diff) {
  if (diff === undefined || isInitialDiff(results, diff)) {
    return
  }

  return find(results, diff)
}

// We do not error when using the default `--diff` and no results have been
// saved yet
const isInitialDiff = function (results, { queryType, queryValue }) {
  return queryType === 'count' && queryValue === 1 && results.length === 0
}

// Retrieve the difference of median compared with a previous result
export const getDiff = function (results, diffIndex, { median }) {
  if (diffIndex === undefined) {
    return {}
  }

  // eslint-disable-next-line fp/no-mutating-methods
  const diffCombination = [...results]
    .reverse()
    .find(({ result }) => result <= diffIndex)

  // This can happen when some combinations have a previous result but others
  // not
  if (diffCombination === undefined) {
    return {}
  }

  const {
    stats: { median: previousMedian },
  } = diffCombination

  const diff = computeDiff(median, previousMedian)
  return { previousMedian, diff }
}

const computeDiff = function (median, previousMedian) {
  if (previousMedian === 0 || median === 0) {
    return
  }

  return median / previousMedian - 1
}
