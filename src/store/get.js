import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/main.js'
import { UserError } from '../error/main.js'
import { mergeResults } from '../normalize/merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (results, delta, { since }) {
  const resultsA = await listResultsByDelta(results, delta)
  const result = await mergeResults(resultsA, since)
  return result
}

const listResultsByDelta = async function (results, delta) {
  if (results.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(results, delta)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  return results.slice(0, index + 1)
}
