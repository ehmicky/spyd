import sortOn from 'sort-on'

import { selectRawResults } from '../../select/main.js'
import { normalizeSystems } from '../../system/merge.js'

import { decompressRawResult } from './compress.js'
import { migrateRawResults } from './migrate.js'

// Normalize rawResults on load
export const loadRawResults = function (rawResults, select) {
  const rawResultsA = migrateRawResults(rawResults)
  const rawResultsB = rawResultsA.map(decompressRawResult).map(normalizeSystems)
  const rawResultsC = selectRawResults(rawResultsB, select)
  const rawResultsD = sortResults(rawResultsC)
  return rawResultsD
}

const sortResults = function (rawResults) {
  return sortOn(rawResults, 'timestamp')
}
