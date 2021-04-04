import { handleCombinationError } from '../error/combination.js'

import { endCombination } from './end.js'
import { exitCombination } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends and exits, for cleanup.
export const measureAllCombinations = async function ({
  combinations,
  combination,
  index,
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
    index,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
    server,
  })
  const combinationC = await endCombination(combinationB, previewState, server)
  const combinationD = await exitCombination(combinationC)
  handleCombinationError(combinationD)
  return combinationD
}
