import { UserError } from '../error/main.js'

import { matchSelectors } from './match.js'
import { parseSelectors } from './parse.js'

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
  const includeSelectors = parseSelectors(include, 'include', combinationsIds)
  const excludeSelectors = parseSelectors(exclude, 'exclude', combinationsIds)

  const combinationsA = combinations
    .filter((combination) => matchSelectors(combination, includeSelectors))
    .filter((combination) => matchSelectors(combination, excludeSelectors))

  // TODO: add `original`
  if (combinationsA.length === 0) {
    throw new UserError(
      'No combinations match the "include" and "exclude" properties.',
    )
  }

  return combinationsA
}
