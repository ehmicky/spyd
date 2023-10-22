import { getCombinationIds } from '../combination/ids/get.js'

// Select combinations according to the `select|limit` configuration properties.
// Each selector:
//  - Is an intersection of union of identifiers
//  - Can be negated to exclude instead of including
//  - Can be combined as a union with other selectors
//  - This leads to: [not]((id or ...) and (otherId or ...) and ...) or ...
// This logic:
//  - Is expressive enough to allow selecting any sets of combinations,
//    regardless of the number of dimensions
//  - While still have a small number of complexity, only: list of identifiers,
//    "not" and top-level array.
//  - Avoids punctuation or hard-to-remember syntax
// The array order is significant:
//  - Only the last matching selector is used for each combination
//  - Combination with no matching selector are excluded|included depending on
//    whether the first selector is negated or not
//  - While this adds complexity, this removes the need for having two
//    different syntax tokens to express both inversion (of a single identifier)
//    and exclusion (of a selector), which would be required otherwise to be
//    able the following cases, for example, assuming two dimensions going from
//    a-z and 0-99:
//     - inclusion of almost all (but not all) combinations of a dimension,
//       e.g. include a1-99 and b-z0
//     - vice-versa, e.g. include all but a1-99 and b-z0
//     - inclusion of all but specific combinations, e.g. b2 and o5
export const matchSelectors = (combination, selectors) => {
  if (isEmpty(selectors)) {
    return true
  }

  const combinationIds = getCombinationIds(combination).map(
    normalizeCombinationId,
  )
  const index = selectors.findLastIndex((selector) =>
    matchIds(combinationIds, selector),
  )

  if (index === -1) {
    return selectors[0].negation
  }

  return !selectors[index].negation
}

// Matching is case-insensitive
const normalizeCombinationId = (id) => id.toLowerCase()

// An empty array selects any combinations:
//  - In principle, users might expect either any or no combinations to be
//    selected since the array might be meant as negated or not, which we don't
//    know without its first element
//  - In practice, users most likely want to select any combinations since
//    selecting none is much less useful
//  - This is the default value of `select`
// An empty selector string:
//  - Selects nothing (or anything if prepended with "not") since this follows
//    logically from the syntax
//  - However, if the only selector is an empty string, it selects everything
//    instead.
//     - While less logical, it is what users most likely mean
//     - Also, it avoids --select= and --select="" from behaving differently
const isEmpty = (selectors) =>
  selectors.length === 0 ||
  (selectors.length === 1 && selectors[0].intersect.flat().length === 0)

const matchIds = (combinationIds, { intersect }) =>
  intersect.every((ids) => matchGroup(combinationIds, ids))

const matchGroup = (combinationIds, ids) =>
  ids.some((id) => anyMatchId(combinationIds, id))

const anyMatchId = (combinationIds, id) =>
  combinationIds.some((combinationId) => matchId(combinationId, id))

// We allow partial substring matching:
//  - Use cases:
//     - Allows selecting a group of related tasks
//     - Faster to type on the CLI
//  - Simpler yet as useful as globbing or regular expressions
const matchId = (combinationId, id) => combinationId.includes(id)
