import { UserError } from '../error/main.js'
import { findValue } from '../utils/find.js'

import { getDeltaProp, addDeltaError } from './error.js'
import { FORMATS, findFormat } from './formats/main.js'

// Several configuration properties targets a previous results using a delta,
// which can an integer, date/time, result.id or git commit.
// Previous results are always first filtered by `select`.
// This validates and normalizes it to a `deltaQuery` object.
export const normalizeDelta = function (delta, name, envInfo) {
  if (delta === '') {
    const deltaProp = getDeltaProp(delta, name)
    throw new UserError(`${deltaProp} must not be an empty string`)
  }

  const deltaReturn = findValue(FORMATS, (format) =>
    parseDelta({ format, delta, name, envInfo }),
  )

  if (deltaReturn === undefined) {
    const deltaProp = getDeltaProp(delta, name)
    throw new UserError(
      `${deltaProp} must be a number, a date, a time, an id or a git commit/tag/branch.`,
    )
  }

  const [value, { type }] = deltaReturn
  return { type, value, delta, name }
}

const parseDelta = function ({
  format: { parse, type },
  delta,
  name,
  envInfo,
}) {
  try {
    return parse(delta, envInfo)
  } catch (error) {
    throw addDeltaError(error, { type, delta, name })
  }
}

// Get previous results index by result delta.
// `results` must be sorted from most to least recent.
// In general, most delta formats look for the first result after the delta.
//   - This allows users to specify loose deltas without errors, such as
//     "100" even if there are only 3 results.
//   - However, few formats look for the last result before the delta instead
//     since it makes more sense for those.
// Returns -1 when no delta is found:
//  - Either because:
//     - There are no results
//     - The delta points to a time in the future or to a non-existing reference
//  - If the delta has a syntax or semantics that we know is always erroneous,
//    we throw instead
//  - When this happens with the `show` or `remove` commands, we fail hard
//    because there is no result to use.
//  - However, with the `since` configuration property, we silently ignore it
//    instead, i.e. `showDiff`, `limit` and `previous` are not used.
export const findByDelta = async function (
  results,
  { type, value, delta, name },
  cwd,
) {
  if (results.length === 0) {
    return -1
  }

  const { find } = findFormat(type)

  try {
    return await find(results, value, cwd)
  } catch (error) {
    throw addDeltaError(error, { type, delta, name })
  }
}
