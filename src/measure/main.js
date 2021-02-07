import { startPreview, endPreview } from '../preview/start_end.js'
import { startServer, endServer } from '../server/start_end.js'

import { addInitProps } from './props.js'
import { spawnAndMeasure } from './spawn.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
export const measureBenchmark = async function (
  combinations,
  { duration, cwd, exec, previewConfig },
) {
  const combinationsA = combinations.map(addInitProps)

  const { previewState, previewId } = await startPreview({
    combinations: combinationsA,
    duration,
    previewConfig,
  })

  try {
    return await startServerAndMeasure({
      combinations: combinationsA,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
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
  previewState,
  exec,
  stopState,
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
      previewState,
      exec,
      stopState,
    })
  } finally {
    await endServer(server)
  }
}
