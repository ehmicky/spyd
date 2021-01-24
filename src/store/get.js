import { findByDelta } from '../delta/main.js'
import { mergeResults } from '../normalize/merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = function (results, delta, { since }) {
  const resultsA = listResultsByDelta(results, delta)
  const result = mergeResults(resultsA, since)
  return result
}

const listResultsByDelta = function (results, delta) {
  const index = findByDelta(results, delta)
  return results.slice(index)
}
