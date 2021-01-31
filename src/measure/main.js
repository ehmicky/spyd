import { startPreview, endPreview } from '../preview/start_end.js'
import { startServer, endServer } from '../server/start_end.js'

import { addInitProps } from './props.js'
import { spawnAndMeasure } from './spawn.js'
import { getStopState } from './stop.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
export const measureBenchmark = async function (
  combinations,
  { duration, quiet, cwd },
  { exec, previewConfig },
) {
  const combinationsA = combinations.map(addInitProps)

  const stopState = getStopState()
  const {
    previewState,
    previewConfig: previewConfigA,
    previewId,
  } = await startPreview({
    combinations: combinationsA,
    duration,
    quiet,
    previewConfig,
  })

  try {
    const combinationsB = await startServerAndMeasure({
      combinations: combinationsA,
      duration,
      cwd,
      previewConfig: previewConfigA,
      exec,
      stopState,
      previewState,
    })
    return { combinations: combinationsB, stopped: stopState.stopped }
  } finally {
    await endPreview(previewId)
  }
}

// Start server to communicate with combinations, then measure them
const startServerAndMeasure = async function ({
  combinations,
  duration,
  cwd,
  previewConfig,
  exec,
  stopState,
  previewState,
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
      previewConfig,
      exec,
      stopState,
      previewState,
    })
  } finally {
    await endServer(server)
  }
}
