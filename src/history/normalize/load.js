import sortOn from 'sort-on'

import { selectResults } from '../../select/main.js'

import { decompressResult } from './compress.js'
import { migrateResults } from './migrate.js'

// Normalize results on load
export const loadResults = function (results, select) {
  const resultsA = migrateResults(results)
  const resultsB = resultsA.map(decompressResult)
  const resultsC = selectResults(resultsB, select)
  const resultsD = sortResults(resultsC)
  return resultsD
}

const sortResults = function (results) {
  return sortOn(results, 'timestamp')
}
