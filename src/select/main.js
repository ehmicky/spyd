import { applyTargets } from './apply.js'
import { getTargets } from './targets.js'
import { validateTargets } from './validate.js'

// Select iterations according to options `tasks` and `inputs`.
// For the `run` and `debug` commands.
export const selectIterations = function (iterations, { tasks, inputs }) {
  const [{ iterations: iterationsA }] = selectBenchmarks([{ iterations }], {
    tasks,
    inputs,
  })
  return iterationsA
}

// Select benchmarks according to options `tasks`, `inputs`, `system` and `run`.
// For the `show` command.
export const selectBenchmarks = function (rawBenchmarks, opts) {
  const targets = getTargets(opts)
  validateTargets(targets, rawBenchmarks)

  const rawBenchmarksA = rawBenchmarks
    .map((rawBenchmark) => applyTargets(rawBenchmark, targets))
    .filter(hasIterations)

  if (rawBenchmarksA.length === 0) {
    throw new Error('No matching selection')
  }

  return rawBenchmarksA
}

// Benchmarks with no matching selections are removed from the set.
// This means deltas and reporting only apply to the current set of matching
// benchmarks.
const hasIterations = function ({ iterations }) {
  return iterations.length !== 0
}
