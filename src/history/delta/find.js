import { UserError } from '../../error/main.js'
import { wrapError } from '../../error/wrap.js'

import { getDeltaError } from './error.js'
import { findFormat } from './formats/main.js'

// We use deltas to locate specific rawResults in the history for either:
//  - The main delta used to target the result, which is also the end of the
//    history, with the `show|remove` command
//  - The delta used by the `since` configuration property to limit the start
//    of the history
// Deltas are resolved based on results metadata, not contents
//  - This allows only loading the contents of results which are actually needed
//    by the command, which is much more performant
// Deltas are either absolute (e.g. timestamps) or relative (e.g. duration)
//  - When relative, the main delta is relative to the end of the history,
//   while the `since` delta is relative to the main delta.
// The metadata and history are:
//  - Sorted from most to least recent
//  - Grouped by `id`
// When a delta is approximative, the first rawResult after (not before) the
// delta is usually used
//  - This allows users to specify loose deltas without errors, such as
//    "100" even if there are only 3 rawResults.
//  - However, few formats look for the last rawResult before the delta instead
//    since it makes more sense for those.
// The delta might not find any result:
//  - This:
//     - Fails with the main delta since the show|remove command would not
//       make sense then
//     - Does not fail with the `since` delta: the history is just empty
//        - This also mean `stats.diff` is undefined
//  - This can be due to:
//     - The history being empty
//     - The delta points to a time in the future or to a non-existing reference
// This is in contrast to syntactical or semantical errors which always throw.
export const applyMainDelta = async function (metadataGroups, { delta, cwd }) {
  if (metadataGroups.length === 0) {
    throw new UserError('No previous results.')
  }

  const index = await findByDelta(metadataGroups, delta, cwd)

  if (index === -1) {
    const deltaError = getDeltaError(delta)
    throw new UserError(`${deltaError} matches no results.`)
  }

  return metadataGroups.slice(0, index + 1)
}

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
// The first item in `result.history` is the result targeted by `since`:
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
export const applySinceDelta = async function (metadataGroups, { since, cwd }) {
  if (metadataGroups.length === 0) {
    return []
  }

  const index = await findByDelta(metadataGroups, since, cwd)

  if (index === -1) {
    return []
  }

  return metadataGroups.slice(index)
}

const findByDelta = async function (
  metadataGroups,
  { type, value, delta, name },
  cwd,
) {
  const format = findFormat(type)

  try {
    return await format.find(metadataGroups, value, cwd)
  } catch (error) {
    throw wrapError(error, getDeltaError({ type, delta, name }))
  }
}
