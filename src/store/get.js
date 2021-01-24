import { getDeltaError } from '../delta/error.js'
import { findByDelta } from '../delta/main.js'
import { UserError } from '../error/main.js'
import { mergeResults, applySince } from '../normalize/merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (results, delta, config) {
  const { lastResult, previous } = await listResultsByDelta(
    results,
    delta,
    config,
  )
  const previousA = await applySince(previous, config)
  const result = mergeResults(lastResult, previousA)
  return result
}

const listResultsByDelta = async function (results, delta, { cwd }) {
  if (results.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(results, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  const lastResult = results[index]
  const previous = results.slice(0, index)
  return { lastResult, previous }
}
