import { UserError } from '../error/main.js'

import { find } from './delta/find.js'
import { listStore } from './list.js'

// Get a previous result by `count` or `timestamp`
export const getFromStore = async function (delta, config) {
  const results = await listStore(config)
  const result = getResult(results, delta)
  return { result, results }
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
