import { resultHasCombination } from '../combination/result.js'
import { findByDelta } from '../delta/main.js'

import { mergeResults } from './merge.js'

// The `since` configuration property is used to:
//  - Limit the number of results shown in `result.history` which is used with
//    time series reporters.
//  - Specify which previous reports should be merged to the current one with
//    `show|remove` commands
// It is purposely not used for `stats.diff`
//  - The `diff` configuration property is used for it instead. It is based on
//    all previous results regardless of `since`
//  - This decouples both features which is easier to understand
// `since` is relative to the reported result:
//  - For `bench`, this is the result being created
//  - For `show|remove`, this is the result being reported.
//     - This ensures result reported with `show` are shown the same way as when
//       when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the reported result and the "since" result)
// Previous results are filtered by `select`
//  - This purposely impacts the resolution of `since`.
// `since` defaults to 0, i.e. must be opted in.
// Also add `result.history` pointing to previous results after `since` fitering
// This includes the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `bench`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - Since those should report the current result not normalized,
//       i.e. before `mergeLastCombinations` with `show|remove`
//  - We ensure that that result has the same shape as other history results,
//    i.e. before normalization
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
export const applySince = async function (result, previous, { since, cwd }) {
  const sinceIndex = await findByDelta(previous, since, cwd)
  return sinceIndex === -1
    ? applyDefaultSince(result, previous)
    : applyRegularSince(result, previous, sinceIndex)
}

const applyDefaultSince = function (result, previous) {
  if (previous.length === 0) {
    return { ...result, history: [result] }
  }

  const sinceIndex = previous.length - 1
  const sinceResult = mergeResults(
    previous[sinceIndex],
    previous.slice(0, sinceIndex),
  )
  const sinceResultA = removeCombinations(sinceResult, result)
  const history = [sinceResultA, ...previous.slice(sinceIndex + 1), result]
  return { ...result, history }
}

const applyRegularSince = function (result, previous, sinceIndex) {
  const mergedResult = mergeResults(result, previous.slice(sinceIndex))
  const sinceResult = mergeResults(
    previous[sinceIndex],
    previous.slice(0, sinceIndex),
  )
  const sinceResultA = removeCombinations(sinceResult, mergedResult)
  const history = [sinceResultA, ...previous.slice(sinceIndex + 1), result]
  return { ...mergedResult, history }
}

const removeCombinations = function (sinceResult, mergedResult) {
  const combinations = sinceResult.combinations.filter((combination) =>
    resultHasCombination(mergedResult, combination),
  )
  return { ...sinceResult, combinations }
}
