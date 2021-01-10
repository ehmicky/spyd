import { UserError } from '../error/main.js'
import { normalizeResult } from '../normalize/main.js'
import { addPrevious } from '../normalize/previous.js'
import { selectResults } from '../select/main.js'

import { migrateResults } from './migrate.js'
import { sortResults } from './sort.js'

// List, sort, filter and normalize all results
export const listStore = async function ({
  store,
  include,
  exclude,
  limits,
  diff,
}) {
  const results = await callList(store)
  const resultsA = migrateResults(results)
  const resultsB = sortResults(resultsA)
  const resultsC = selectResults(resultsB, { include, exclude })
  const resultsD = resultsC.map(normalizeResult)
  const resultsF = addPrevious(resultsD, { limits, diff })
  return resultsF
}

// Call `store.list()`
const callList = async function (store) {
  try {
    return await store.list()
  } catch (error) {
    throw new UserError(`Could not list previous results: ${error.message}`)
  }
}
