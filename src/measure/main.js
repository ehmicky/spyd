import { startProgress, endProgress } from '../progress/start_end.js'
import { startServer, endServer } from '../server/start_end.js'

import { addInitProps } from './props.js'
import { spawnAndMeasure } from './spawn.js'
import { getStopState } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
export const measureBenchmark = async function (
  combinations,
  { duration, preview = true, cwd, exec = false },
) {
  const stopState = getStopState()
  const { progressState, progressId } = startProgress({
    combinations,
    duration,
    preview,
  })

  try {
    const combinationsA = combinations.map(addInitProps)
    const combinationsB = await startServerAndMeasure({
      combinations: combinationsA,
      duration,
      cwd,
      exec,
      stopState,
      progressState,
    })
    return { combinations: combinationsB, stopped: stopState.stopped }
  } finally {
    await endProgress(progressId)
  }
}

// Start server to communicate with combinations, then measure them
const startServerAndMeasure = async function ({
  combinations,
  duration,
  cwd,
  exec,
  stopState,
  progressState,
}) {
  const { server, origin, combinations: combinationsA } = await startServer(
    combinations,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations: combinationsA,
      origin,
      duration,
      cwd,
      exec,
      stopState,
      progressState,
    })
  } finally {
    await endServer(server)
  }
}
