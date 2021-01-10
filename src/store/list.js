import { UserError } from '../error/main.js'
import { normalizeResult } from '../normalize/main.js'

import { mergePartialResults } from './merge.js'
import { sortResults } from './sort.js'

// List, sort, filter and normalize all results
export const listStore = async function ({ store, ...config }) {
  const partialResults = await callList(store)
  const partialResultsA = sortResults(partialResults)
  const partialResultsB = selectPartialResults(partialResultsA, config)
  const results = mergePartialResults(partialResultsB)
  const resultsA = results.map(normalizeResult)
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
