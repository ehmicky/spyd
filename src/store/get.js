import { UserError } from '../error/main.js'
import { mergeResults } from '../normalize/merge.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, config) {
  const results = await listStore(config)

  const resultsA = listResultsByDelta(results, delta)
  const result = mergeResults(resultsA)
  return result
}

const listResultsByDelta = function (results, delta) {
  try {
    const index = find(results, delta)
    return results.slice(0, index)
  } catch (error) {
    throw new UserError(`Could not find previous results: ${error.message}`)
  }
}
