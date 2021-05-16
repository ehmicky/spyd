import { selectResults } from '../select/main.js'

import { decompressResults } from './compress.js'
import { groupCombinations } from './group.js'
import { migrateResults } from './migrate.js'
import { sortResults } from './sort.js'

// Normalize results on load
export const loadResults = function (results, select) {
  const resultsA = migrateResults(results)
  const resultsB = decompressResults(resultsA)
  const resultsC = sortResults(resultsB)
  const resultsD = selectResults(resultsC, select)
  const resultsE = resultsD.map(addResultsIds)
  const resultsF = groupCombinations(resultsE)
  return resultsF
}

const addResultsIds = function (result) {
  const combinations = result.combinations.map((combination) => ({
    ...combination,
    resultId: result.id,
  }))
  return { ...result, combinations }
}
