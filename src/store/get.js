import { UserError } from '../error/main.js'
import { mergePartialResults } from '../merge/partial.js'
import { selectPartialResults } from '../select/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, config) {
  const partialResults = await listStore(config)

  const partialResultsA = selectPartialResults(partialResults, config)

  const results = mergePartialResults(partialResultsA)

  const { id } = getResult(results, delta)

  return { id, results }
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
