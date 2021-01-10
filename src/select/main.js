import { UserError } from '../error/main.js'

import { matchSelectors } from './match.js'
import { parseSelectors } from './parse.js'
import { getPrefix } from './prefix.js'

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
export const selectPartialResults = function (
  partialResults,
  { include, exclude },
) {
  return partialResults
    .map((partialResult) =>
      selectPartialResult(partialResult, { include, exclude }),
    )
    .filter(hasCombinations)
}

const selectPartialResult = function (
  { combinations, ...partialResult },
  { include, exclude },
) {
  const combinationsA = selectCombinations(combinations, { include, exclude })
  return { ...partialResult, combinations: combinationsA }
}

export const selectCombinations = function (
  combinations,
  { include, exclude },
) {
  const combinationsA = applySelection(include, 'include', combinations)
  const combinationsB = applySelection(exclude, 'exclude', combinationsA)
  return combinationsB
}

const applySelection = function (rawSelectors, propName, combinations) {
  const includeSelectors = parseSelectors(rawSelectors, propName, combinations)
  const combinationsA = combinations.filter((combination) =>
    matchSelectors(combination, includeSelectors),
  )

  if (combinationsA.length === 0) {
    const prefix = getPrefix(rawSelectors, propName)
    throw new UserError(`${prefix}No combinations match the selection.`)
  }

  return combinationsA
}

const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
