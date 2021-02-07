import { handleCombinationError } from '../error/combination.js'

import { endCombinations } from './end.js'
import { exitCombinations } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { startCombinations } from './start.js'

// Measure all combinations, until there is no `duration` left.
export const measureAllCombinations = async function ({
  combinations,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
}) {
  const combinationsA = await startCombinations(combinations, previewState)
  const combinationsB = await performMeasureLoop({
    combinations: combinationsA,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
  })
  const combinationsC = await endCombinations(combinationsB, previewState)
  const combinationsD = await exitCombinations(combinationsC)
  handleCombinationError(combinationsD)
  return combinationsD
}
