import { matchSelectors } from './match.js'
import { parseSelectors } from './parse.js'
import { validateSelectMatches } from './validate.js'

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
//  - However, in the `run` command, we both measure and report.
//  - We purposely do not provide separate configuration properties for both
//    cases because:
//     - Only reporting what is being measured is more intuitive and provides
//       with a stronger focus
//     - This provides with fewer configuration properties, which is simpler
//  - If users use `select` to limit how many combinations are being measured,
//    but still want to see all combinations, they should perform two commands:
//    first `run` then `show`.
// Selection happens after delta resolution:
//  - This means the `count` delta format targets results regardless of whether
//    they are selected
//  - This is because:
//     - Changing `select` does not change the history start|end, which is less
//       confusing
//     - This does not require loading files before resolving deltas
export const selectResult = (result, select) => {
  const combinations = selectCombinations(result.combinations, select)
  return { ...result, combinations }
}

export const selectCombinations = (combinations, select) => {
  const selectors = parseSelectors(select, 'select')
  const combinationsA = combinations.filter((combination) =>
    matchSelectors(combination, selectors),
  )
  validateSelectMatches(combinationsA, select)
  return combinationsA
}

// Same for a single combination
export const matchCombination = (combination, select, name) => {
  const selectors = parseSelectors(select, name)
  return matchSelectors(combination, selectors)
}

export const DEFAULT_SELECT = []
export const EXAMPLE_SELECT = 'taskOne taskTwo'
