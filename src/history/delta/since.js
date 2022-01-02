import { findByDelta } from './find.js'

// The `since` configuration property is used to limit the number of results
// shown in `result.history` which is used with time series reporters.
// `since` is used to target both the first result in time series and the one
// used for `diff` because:
//  - If is simpler to understand
//  - The `diff` must be earlier than any combination in `result.history`,
//    i.e. it makes sense to re-use `since`, and it simplifies the configuration
// `since` is relative to the main result:
//  - For `run`, this is the result being created.
//  - For `show|remove`, this is the result being reported.
//     - This ensures results reported with `show` are shown the same way as
//       when when they were measured.
//     - This is also simpler to understand since it always involves only two
//       bases (the main result and the "since" result)
// When `since` does not target any valid result, we do not show any previous
// results nor diff.
// The first item in `result.history` is the `sinceResult`, i.e. the result
// targeted by `since`:
//  - It is shown first in time series
//     - This ensures each combination shows where it started
//     - This allows users to visualize the `diff` by comparing the first and
//       last item
// The last item in `result.history` is the current result:
//  - For `show|remove`, this is the result targeted by delta
//  - For `run`, this is the currently measured result
//  - This allows time series reporters to use `result.history`
//     - This ensures each combination shows when it was last measured
//     - This ensures the time series reflects other reporters when used
//       together
// We do not expose some `combination.history` property
//  - This would complicate the data model by creating copies of the same
//    properties.
//  - Instead, reporters should use logic to retrieve the history of each
//    combination
export const applySince = async function (rawResult, previous, { since, cwd }) {
  const history = await getHistory(previous, since, cwd)
  return [...history, rawResult]
}

const getHistory = async function (previous, since, cwd) {
  if (previous.length === 0) {
    return []
  }

  const sinceIndex = await findByDelta(previous, since, cwd)
  return sinceIndex === -1 ? [] : previous.slice(sinceIndex)
}
