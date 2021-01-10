import { UserError } from '../error/main.js'

import { matchAllSelectors } from './match.js'
import { parseSelector } from './parse.js'
import { getPrefix } from './prefix.js'
import { tokenizeSelector } from './tokenize.js'

// Select combinations according to the `include` and `exclude` configuration
// properties.
// We use two properties instead of a single `include` one because:
//  - Otherwise, exclusions would be quite verbose in `includea, since they
//    would need to be added to each selector string.
//  - This allows overriding `include` in the CLI while keeping `exclude`,
//    which is most likely what the user might want.
// `exclude` defaults to excluding nothing.
// `include` defaults to including everything. This applies to when it is either
// `undefined` or an empty array. Making an empty array including nothing would
// be more consistent. However, there is little use for it and it most likely
// mean the user intent was to include everything.
export const selectCombinations = function (
  combinations,
  combinationsIds,
  { include, exclude },
) {
  const allSelectors = parseAllSelectors({ include, exclude, combinationsIds })

  const combinationsA = combinations.filter((combination) =>
    matchAllSelectors(combination, allSelectors),
  )

  if (combinationsA.length === 0) {
    throw new UserError(
      'No combinations match the "include" and "exclude" properties.',
    )
  }

  return combinationsA
}

// Parse `include` and `exclude` user-friendly format (array of strings) to a
// code-friendlier format (objects)
// This also validates the syntax.
const parseAllSelectors = function ({ include, exclude, combinationsIds }) {
  return [
    parseSelectors(include, 'include', combinationsIds),
    parseSelectors(exclude, 'exclude', combinationsIds),
  ]
}

const parseSelectors = function (selectors, propName, combinationsIds) {
  const prefix = getPrefix(selectors, propName)
  const selectorsA = selectors
    .map((selector) => tokenizeSelector(selector, prefix))
    .map((tokens) => parseSelector(tokens, combinationsIds, prefix))
  return { selectors: selectorsA, propName }
}
