import { UserError } from '../error/main.js'

import { filterBySelectors } from './match.js'
import { parseSelectExclude } from './parse.js'
import { getPrefix } from './prefix.js'

// Select combinations according to the `select` and `exclude` configuration
// properties.
// We use two properties instead of a single `select` one because:
//  - Otherwise, exclusions would be quite verbose in `select`, since they
//    would need to be added to each selector string.
//  - This allows overriding `select` in the CLI while keeping `exclude`,
//    which is most likely what the user might want.
// `exclude` defaults to excluding nothing.
// `select` defaults to including everything. This applies to when it is either
// `undefined` or an empty array. Making an empty array including nothing would
// be more consistent. However, there is little use for it and it most likely
// mean the user intent was to select everything.
// Selection can be meant to filter which combination is being either measured,
// or reported
//  - In the `show` and `remove` commands, only reporting is happening
//  - However, in the `bench` command, we both measure and report.
//  - We purposely do not provide separate configuration properties for both
//    cases because:
//     - Only reporting what is being measured is more intuitive and provides
//       with a stronger focus
//     - This provides with fewer configuration properties, which is simpler
//  - If users use `select|exclude` to limit how many combinations are
//    being measured, but still want to see all combinations, they should
//    perform two commands: first `bench` then `show`.
export const selectResults = function (results, { select, exclude }) {
  return results
    .map((result) => selectResult(result, { select, exclude }))
    .filter(hasCombinations)
}

const selectResult = function (
  { combinations, ...result },
  { select, exclude },
) {
  const { selectSelectors, excludeSelectors } = parseSelectExclude({
    select,
    exclude,
    combinations,
  })
  const combinationsA = filterBySelectors(combinations, selectSelectors)
  const combinationsB = filterBySelectors(combinationsA, excludeSelectors)
  return { ...result, combinations: combinationsB }
}

export const selectCombinations = function (combinations, { select, exclude }) {
  const { selectSelectors, excludeSelectors } = parseSelectExclude({
    select,
    exclude,
    combinations,
  })
  const combinationsA = strictSelection(combinations, selectSelectors)
  const combinationsB = strictSelection(combinationsA, excludeSelectors)
  return combinationsB
}

// When selecting combinations with `select|exclude`, at least one must
// match. However, when filtering previous combinations, we silently ignore
// results with no matching combinations instead.
const strictSelection = function (combinations, allSelectors) {
  const combinationsA = filterBySelectors(combinations, allSelectors)

  if (combinationsA.length === 0) {
    const prefix = getPrefix(allSelectors)
    throw new UserError(`${prefix}No combinations match the selection.`)
  }

  return combinationsA
}

const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
