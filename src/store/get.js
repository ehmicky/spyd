import { find } from '../delta/find.js'
import { mergeResults } from '../normalize/merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = function (results, delta) {
  const resultsA = listResultsByDelta(results, delta)
  const result = mergeResults(resultsA)
  return result
}

const listResultsByDelta = function (results, delta) {
  const index = find(results, delta)
  return results.slice(index)
}
