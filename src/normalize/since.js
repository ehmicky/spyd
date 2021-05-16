import { resultHasCombination } from '../combination/result.js'
import { findByDelta } from '../delta/main.js'

import { mergeResults } from './merge.js'

// The `since` configuration property is used to:
//  - Limit the number of results shown in `result.history` which is used with
//    time series reporters.
//  - Specify which previous reports should be merged to the main result
// `since` is relative to the main result:
//  - For `bench`, this is the result being created.
//  - For `show|remove`, this is the result being reported.
//     - This ensures results reported with `show` are shown the same way as
//       when when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the main result and the "since" result)
// Previous results are filtered by `select`
//  - This purposely impacts the resolution of `since`.
// `since` defaults to 0, i.e. must be opted in.
// `result.history` includes the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `bench`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - Since those should report the current result before merging
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
export const applySince = async function (result, previous, { since, cwd }) {
  if (previous.length === 0) {
    return { ...result, history: [result] }
  }

  const sinceIndex = await findByDelta(previous, since, cwd)

  if (sinceIndex === -1) {
    return addHistory({
      previous,
      sinceIndex: previous.length - 1,
      mergedResult: result,
      result,
    })
  }

  const mergedResult = mergeResults(result, previous.slice(sinceIndex))
  return addHistory({ previous, sinceIndex, mergedResult, result })
}

const addHistory = function ({ previous, sinceIndex, mergedResult, result }) {
  const sinceResult = removeCombinations(previous[sinceIndex], mergedResult)
  const beforeSince = previous
    .slice(0, sinceIndex)
    .map((beforeSinceResult) =>
      removeCombinations(beforeSinceResult, mergedResult),
    )
  const sinceResultA = mergeResults(sinceResult, beforeSince)
  const history = [sinceResultA, ...previous.slice(sinceIndex + 1), result]
  return { ...mergedResult, history }
}

const removeCombinations = function (sinceResult, mergedResult) {
  const combinations = sinceResult.combinations.filter((combination) =>
    resultHasCombination(mergedResult, combination),
  )
  return { ...sinceResult, combinations }
}
