import { addCombinationsDiff } from '../compare/diff.js'
import { addSharedSystem } from '../system/shared.js'

import { groupResultCombinations } from './group.js'
import { addHistory, mergeLastCombinations } from './since.js'

// Normalize the main result of the `bench` command
export const normalizeBenchResult = function (result, previous, history) {
  const resultA = addHistory(result, history)
  const resultB = mergeResults(resultA, previous)
  return resultB
}

// Normalize the main result of the `show|remove` commands
export const normalizeShowResult = function (result, previous, history) {
  const resultA = addHistory(result, history)
  const resultB = mergeLastCombinations(resultA, history)
  const resultC = mergeResults(resultB, previous)
  return resultC
}

// Normalize the main result:
//  - Add `combination.stats.diff[Precise]` based on previous results before
//    `since` filtering
//  - Add category grouping and ranking
//  - Add `result.systems[0]` (shared system)
const mergeResults = function (result, previous) {
  const resultA = addCombinationsDiff(result, previous)
  const resultB = groupResultCombinations(resultA)
  const resultC = addSharedSystem(resultB)
  return resultC
}
