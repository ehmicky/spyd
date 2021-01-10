import { UserError } from '../error/main.js'
import { normalizeResult } from '../normalize/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'
import { mergePartialResults } from './merge.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, config) {
  const partialResults = await listStore(config)
  const results = mergePartialResults(partialResults)
  const resultsA = results.map(normalizeResult)
  const result = getResult(resultsA, delta)
  return { result, results: resultsA }
}

const getResult = function (results, delta) {
  try {
    const index = find(results, delta)
    const result = results[index]
    return result
  } catch (error) {
    throw new UserError(`Could not find previous results: ${error.message}`)
  }
}
