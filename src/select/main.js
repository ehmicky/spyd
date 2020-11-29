import { UserError } from '../error/main.js'

import { applyTargets } from './apply.js'
import { getTargets } from './targets.js'
import { validateTargets } from './validate.js'

// Select combinations according to configuration properties `tasks` and
// `inputs`.
// For the `run` and `debug` commands.
export const selectCombinations = function (combinations, { tasks, inputs }) {
  const [{ combinations: combinationsA }] = selectPartialResults(
    [{ combinations }],
    { tasks, inputs },
  )
  return combinationsA
}

// Select partialResults according to configuration properties `tasks`,
// `inputs`, `system` and `run`. For the `show` command.
export const selectPartialResults = function (partialResults, config) {
  const targets = getTargets(config)
  validateTargets(targets, partialResults)

  const partialResultsA = partialResults
    .map((partialResult) => applyTargets(partialResult, targets))
    .filter(hasCombinations)

  if (partialResultsA.length === 0) {
    throw new UserError('No matching selection')
  }

  return partialResultsA
}

// partialResults with no matching selections are removed from the set.
// This means deltas and reporting only apply to the current set of matching
// partialResults.
const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
