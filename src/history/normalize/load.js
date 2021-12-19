import sortOn from 'sort-on'

import { namespaceDimensionIds } from '../../combination/ids/namespace.js'
import { selectRawResults } from '../../select/main.js'

import { decompressRawResult } from './compress.js'
import { migrateRawResults } from './migrate.js'

// Normalize rawResults on load
export const loadRawResults = function (rawResults, select, newCombinations) {
  const rawResultsA = migrateRawResults(rawResults)
  const rawResultsB = rawResultsA.map(decompressRawResult)
  const rawResultsC = namespaceDimensionIds(rawResultsB, newCombinations)
  const rawResultsD = selectRawResults(rawResultsC, select)
  const rawResultsE = sortResults(rawResultsD)
  return rawResultsE
}

const sortResults = function (rawResults) {
  return sortOn(rawResults, 'timestamp')
}
