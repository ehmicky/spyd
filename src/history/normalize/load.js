import sortOn from 'sort-on'

import { namespaceDimensionIds } from '../../combination/ids/namespace.js'
import { selectRawResults } from '../../select/main.js'
import { normalizeSystems } from '../../system/merge.js'
import { renameAllSystemIds } from '../../system/rename.js'

import { decompressRawResult } from './compress.js'
import { migrateRawResults } from './migrate.js'

// Normalize rawResults on load
export const loadRawResults = function (rawResults, select, newCombinations) {
  const rawResultsA = migrateRawResults(rawResults)
  const rawResultsB = rawResultsA.map(decompressRawResult)
  const rawResultsC = rawResultsB.map(normalizeSystems)
  const rawResultsD = namespaceDimensionIds(rawResultsC, newCombinations)
  const rawResultsE = renameAllSystemIds(rawResultsD)
  const rawResultsF = selectRawResults(rawResultsE, select)
  const rawResultsG = sortResults(rawResultsF)
  return rawResultsG
}

const sortResults = function (rawResults) {
  return sortOn(rawResults, 'timestamp')
}
