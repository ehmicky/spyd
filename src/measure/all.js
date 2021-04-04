import { endCombination } from './end.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
export const measureAllCombinations = async function ({
  combination,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
}) {
  const { res, taskIds, minLoopDuration } = await startCombination(
    combination,
    previewState,
    server,
  )
  const { combination: combinationA, res: resA } = await performMeasureLoop({
    combination,
    duration,
    previewConfig,
    previewState,
    stopState,
    exec,
    server,
    res,
    minLoopDuration,
  })
  await endCombination(previewState, server, resA)
  return { combination: combinationA, taskIds }
}
