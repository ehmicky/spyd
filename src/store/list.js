import { UserError } from '../error/main.js'
import { normalizeResult } from '../normalize/main.js'
import { selectPartialResults } from '../select/main.js'

import { mergePartialResults } from './merge.js'
import { migratePartialResults } from './migrate.js'
import { sortPartialResults } from './sort.js'

// List, sort, filter and normalize all results
export const listStore = async function ({ store, include, exclude }) {
  const partialResults = await callList(store)
  const partialResultsA = migratePartialResults(partialResults)
  const partialResultsB = sortPartialResults(partialResultsA)
  const partialResultsC = selectPartialResults(partialResultsB, {
    include,
    exclude,
  })
  const results = mergePartialResults(partialResultsC)
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
