import { findByDelta } from '../delta/main.js'
import { mergeResults } from '../normalize/merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (results, delta, { since }) {
  const resultsA = await listResultsByDelta(results, delta)
  const result = await mergeResults(resultsA, since)
  return result
}

const listResultsByDelta = async function (results, delta) {
  const index = await findByDelta(results, delta)
  return results.slice(index)
}
