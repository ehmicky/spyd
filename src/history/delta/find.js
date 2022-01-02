import { addDeltaError } from './error.js'
import { findFormat } from './formats/main.js'

// Get previous rawResults index by rawResult delta.
// `rawResults` must be sorted from most to least recent.
// In general, most delta formats look for the first rawResult after the delta.
//   - This allows users to specify loose deltas without errors, such as
//     "100" even if there are only 3 rawResults.
//   - However, few formats look for the last rawResult before the delta instead
//     since it makes more sense for those.
// Returns -1 when no delta is found:
//  - Either because:
//     - There are no rawResults
//     - The delta points to a time in the future or to a non-existing reference
//  - If the delta has a syntax or semantics that we know is always erroneous,
//    we throw instead
//  - When this happens with:
//     - `show|remove` delta: we fail hard because there is no rawResult to
//        report
//     - `since` configuration property: `rawResult.history` is empty
//     - `diff` configuration property: `stats.diff` is `undefined`
export const findByDelta = async function (
  rawResults,
  { type, value, delta, name },
  cwd,
) {
  if (rawResults.length === 0) {
    return -1
  }

  const { find } = findFormat(type)

  try {
    return await find(rawResults, value, cwd)
  } catch (error) {
    throw addDeltaError(error, { type, delta, name })
  }
}
