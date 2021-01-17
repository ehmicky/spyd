import { UserError } from '../error/main.js'
import { loadResults } from '../normalize/load.js'

// List, sort, filter and normalize all results
// This is performed at the beginning of all commands because this allows:
//  - Failing fast if there is a problem with the store
//  - Including previous|diff in live reporting
export const listStore = async function ({ store, include, exclude }) {
  const results = await callList(store)
  const resultsA = loadResults({ results, include, exclude })
  return resultsA
}

// Call `store.list()`
const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
