import { UserError } from '../error/main.js'

import { applyTargets } from './apply.js'
import { getTargets } from './targets.js'
import { validateTargets } from './validate.js'

// Select combinations according to options `tasks` and `inputs`.
// For the `run` and `debug` commands.
export const selectCombinations = function (combinations, { tasks, inputs }) {
  const [{ combinations: combinationsA }] = selectBenchmarks(
    [{ combinations }],
    { tasks, inputs },
  )
  return combinationsA
}

// Select benchmarks according to options `tasks`, `inputs`, `system` and `run`.
// For the `show` command.
export const selectBenchmarks = function (rawBenchmarks, opts) {
  const targets = getTargets(opts)
  validateTargets(targets, rawBenchmarks)

  const rawBenchmarksA = rawBenchmarks
    .map((rawBenchmark) => applyTargets(rawBenchmark, targets))
    .filter(hasCombinations)

  if (rawBenchmarksA.length === 0) {
    throw new UserError('No matching selection')
  }

  return rawBenchmarksA
}

// Benchmarks with no matching selections are removed from the set.
// This means deltas and reporting only apply to the current set of matching
// benchmarks.
const hasCombinations = function ({ combinations }) {
  return combinations.length !== 0
}
