import sortOn from 'sort-on'

import { UserError } from '../error/main.js'

// Call `store.list()`
export const listStore = async function ({ store }) {
  const partialResults = await callList(store)
  const partialResultsA = sortOn(partialResults, 'timestamp')
  return partialResultsA
}

const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
