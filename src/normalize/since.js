import {
  pickResultCombinations,
  omitResultCombinations,
} from '../combination/result.js'
import { findByDelta } from '../delta/main.js'
import { mergeSystems } from '../system/merge.js'

import { mergeResults } from './merge.js'

// The `since` configuration property is used to:
//  - Limit the number of results shown in `result.history` which is used with
//    time series reporters.
//  - Specify which previous reports should be merged to the main result
// `since` is used to target both the first result in time series and the one
// used for `diff` because:
//  - If is simpler to understand
//  - The `diff` must be earlier than any combination in `result.history`,
//    i.e. it makes sense to re-use `since`, and it simplifies the configuration
// `since` is relative to the main result:
//  - For `bench`, this is the result being created.
//  - For `show|remove`, this is the result being reported.
//     - This ensures results reported with `show` are shown the same way as
//       when when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the main result and the "since" result)
// Previous results are filtered by `select`
//  - This purposely impacts the resolution of `since`.
// When `since` does not target any valid result:
//  - We use the most recent result as `sinceResult` (if any)
//  - However, we do not merge it
//  - This allows giving a default behavior with `since: 0` which:
//     - Makes merging opt-in. This is good since merging results can be
//       unexpected, especially with `bench` command
//     - While still showing the `diff` with the last result, which is the most
//       likely wanted ones
// The first item in `result.history` is the `sinceResult`, i.e. the result
// targeted by `since`:
//  - It is shown first in time series
//     - This ensure each combination shows where it started
//     - This allows users to visualize the `diff` by comparing the first and
//       last item
// The last item in `result.history` is the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `bench`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - Since those should report the current result before merging
//     - This ensure each combination shows where it was last measured
//     - This ensures the time series reflects other reporters when used
//       together
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
export const applySince = async function (result, previous, { since, cwd }) {
  if (previous.length === 0) {
    return applyNoneSince()
  }

  const sinceIndex = await findByDelta(previous, since, cwd)

  if (sinceIndex === -1) {
    return applyDefaultSince(previous, result)
  }

  return applyRegularSince(previous, sinceIndex, result)
}

// When there is no history
const applyNoneSince = function () {
  return { combinations: [], systems: [], history: [] }
}

// When `since` is 0 (default value)
const applyDefaultSince = function (previous, result) {
  const sinceResult = getSinceResult(previous, previous.length - 1, result)
  return { combinations: [], systems: [], history: [sinceResult] }
}

// When there is a history and a non-default `since`
const applyRegularSince = function (previous, sinceIndex, result) {
  const mergedResult = mergeResults(result, previous.slice(sinceIndex))
  const sinceResult = getSinceResult(previous, sinceIndex, mergedResult)
  const history = [sinceResult, ...previous.slice(sinceIndex + 1)]
  const { combinations, systems } = omitResultCombinations(mergedResult, result)
  return { combinations, systems, history }
}

const getSinceResult = function (previous, sinceIndex, result) {
  const sinceResult = pickResultCombinations(previous[sinceIndex], result)
  const beforeSince = previous
    .slice(0, sinceIndex)
    .map((beforeSinceResult) =>
      pickResultCombinations(beforeSinceResult, result),
    )
  return mergeResults(sinceResult, beforeSince)
}

// In principle, we should do both `applySince()` and `mergeHistoryResult()` at
// the same time, before reporting. However, `applySince()` is slow.
//  - To avoid repeating it before each preview, we compute it only once before
//    all previews and store its return value as `historyResult`.
//  - We then merge the latest result during each preview.
export const mergeHistoryResult = function (result, historyResult) {
  return {
    ...result,
    combinations: [...result.combinations, ...historyResult.combinations],
    systems: mergeSystems(result.systems, historyResult.systems),
    history: [...historyResult.history, result],
  }
}
