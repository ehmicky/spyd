import { UserError } from '../error/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'
import { mergeResults } from './merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, config) {
  const results = await listStore(config)

  const index = getResultIndex(results, delta)
  const resultsA = results.slice(0, index)

  const result = mergeResults(resultsA)
  return result
}

const getResultIndex = function (results, delta) {
  try {
    return find(results, delta)
  } catch (error) {
    throw new UserError(`Could not find previous results: ${error.message}`)
  }
}
