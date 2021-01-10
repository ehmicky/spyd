import { UserError } from '../error/main.js'

import { sortResults } from './sort.js'

// List, sort, filter and normalize all results
export const listStore = async function ({ store, ...config }) {
  const partialResults = await callList(store)
  const partialResultsA = sortResults(partialResults)
  const partialResultsB = selectPartialResults(partialResultsA, config)
  return partialResultsB
}

// Call `store.list()`
const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
