import { handleCombinationError } from '../error/combination.js'

import { endCombination } from './end.js'
import { exitCombination } from './exit.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Measure all combinations, until there is no `duration` left.
export const measureAllCombinations = async function ({
  combinations,
  combination,
  index,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
}) {
  const combinationA = await startCombination(combination, previewState)
  const combinationB = await performMeasureLoop({
    combinations,
    combination: combinationA,
    index,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
  })
  const combinationC = await endCombination(combinationB, previewState)
  const combinationD = await exitCombination(combinationC)
  handleCombinationError(combinationD)
  return combinationD
}
