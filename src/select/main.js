import { matchSelectors } from './match.js'
import { parseSelectors } from './parse.js'
import { throwValidationError } from './validate.js'

// Select combinations according to the `select` configuration properties.
// We use a single `select` property for both inclusion and exclusion:
//  - Selections can be prepended with "not" to exclude
//  - We do not use two separate `include` and `exclude` properties since it
//    would require overriding both when using CLI flags.
//     - For example, if `spyd.yml` was used to `exclude` an id, and we wanted
//       to `include` it as a CLI flag, this would require setting `exclude` to
//       an empty string too.
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

const selectResult = function (result, select) {
  const combinations = filterBySelectors(result.combinations, select)
  return { ...result, combinations }
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
    throwValidationError(
      'No combinations match the selection.',
      select,
      'select',
    )
  }
}

const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
