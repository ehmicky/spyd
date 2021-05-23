import { selectResults } from '../select/main.js'

import { decompressResult } from './compress.js'
import { migrateResults } from './migrate.js'
import { sortResults } from './sort.js'

// Normalize results on load
export const loadResults = function (results, select) {
  const resultsA = migrateResults(results)
  const resultsB = selectResults(resultsA, select)
  const resultsC = resultsB.map(decompressResult)
  const resultsD = sortResults(resultsC)
  return resultsD
}
