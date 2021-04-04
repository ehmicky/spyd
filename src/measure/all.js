import { prependTaskPrefix } from '../error/combination.js'

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
  childProcess,
}) {
  try {
    const combinationA = await startCombination({
      combination,
      previewState,
      server,
      childProcess,
    })
    const combinationB = await performMeasureLoop({
      combinations,
      combination: combinationA,
      duration,
      previewConfig,
      previewState,
      stopState,
      exec,
      server,
      childProcess,
    })
    const combinationC = await endCombination({
      combination: combinationB,
      previewState,
      server,
      childProcess,
    })
    return combinationC
  } catch (error) {
    prependTaskPrefix(error, combination)
    throw error
  }
}
