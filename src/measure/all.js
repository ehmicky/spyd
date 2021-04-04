import { endCombination } from './end.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
export const measureAllCombinations = async function ({
  combinations,
  combination,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
}) {
  const combinationA = await startCombination(combination, previewState, server)
  const combinationB = await performMeasureLoop({
    combinations,
    combination: combinationA,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
    server,
  })
  const combinationC = await endCombination(combinationB, previewState, server)
  return combinationC
}
