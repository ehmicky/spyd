import { UserError } from '../error/main.js'

import { matchSelectors } from './match.js'
import { parseSelectors } from './parse.js'
import { getPrefix } from './prefix.js'

// Select combinations according to the `select` configuration properties.
// `select` defaults to including everything.
///  - This applies to when it is either `undefined` or an empty array.
//   - Making an empty array include nothing would be more consistent.
//     However, there is little use for it and it most likely mean the user
//     intent was to select everything.
// Selection could be meant to select combination either for measuring or
// reporting:
//  - In the `show` and `remove` commands, only reporting is happening
//  - However, in the `bench` command, we both measure and report.
//  - We purposely do not provide separate configuration properties for both
//    cases because:
//     - Only reporting what is being measured is more intuitive and provides
//       with a stronger focus
//     - This provides with fewer configuration properties, which is simpler
//  - If users use `select` to limit how many combinations are being measured,
//    but still want to see all combinations, they should perform two commands:
//    first `bench` then `show`.
export const selectResults = function (results, select) {
  return results
    .map((result) => selectResult(result, select))
    .filter(hasCombinations)
}

const selectResult = function ({ combinations, ...result }, select) {
  const combinationsA = filterBySelectors(combinations, select)
  return { ...result, combinations: combinationsA }
}

export const selectCombinations = function (combinations, select) {
  const combinationsA = filterBySelectors(combinations, select)
  throwOnNoMatches(combinationsA, select)
  return combinationsA
}

const filterBySelectors = function (combinations, select) {
  const selectors = parseSelectors(select, 'select', combinations)
  return combinations.filter((combination) =>
    matchSelectors(combination, selectors),
  )
}

// When selecting combinations with `select`, at least one must match.
// However, when filtering previous combinations, we silently ignore results
// with no matching combinations instead.
const throwOnNoMatches = function (combinations, select) {
  if (combinations.length === 0) {
    const prefix = getPrefix(select, 'select')
    throw new UserError(`${prefix}No combinations match the selection.`)
  }
}

const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
