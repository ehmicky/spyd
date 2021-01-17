import { UserError } from '../error/main.js'
import { loadResults } from '../normalize/load.js'

// List, sort, filter and normalize all results
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
