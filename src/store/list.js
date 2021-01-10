import { UserError } from '../error/main.js'

import { sortResults } from './sort.js'

// Call `store.list()`
export const listStore = async function ({ store }) {
  const partialResults = await callList(store)
  const partialResultsA = sortResults(partialResults)
  return partialResultsA
}

const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
