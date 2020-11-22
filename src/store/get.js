import { UserError } from '../error/main.js'
import { mergePartialResults } from '../merge/partial.js'
import { selectPartialResults } from '../select/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, opts) {
  const partialResults = await listStore(opts)

  const partialResultsA = selectPartialResults(partialResults, opts)

  const results = mergePartialResults(partialResultsA)

  const { mergeId } = getResult(results, delta)

  return { mergeId, results, partialResults: partialResultsA }
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
