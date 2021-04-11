import { endCombination } from './end.js'
import { performMeasureLoop } from './loop.js'
import { startCombination } from './start.js'

// Measure all combinations, until there is no `duration` left.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
export const measureAllCombinations = async function ({
  taskId,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
}) {
  const { res, taskIds, minLoopDuration } = await startCombination(
    previewState,
    server,
  )
  const { stats, res: resA } = await performMeasureLoop({
    taskId,
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
  return { stats, taskIds }
}
