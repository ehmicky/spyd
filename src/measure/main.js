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
  const { previewState, previewId } = await startPreview({
    combinations,
    duration,
    previewConfig,
  })

  try {
    return await startServerAndMeasure({
      combinations,
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
}) {
  const combinationsA = combinations.map(addInitProps)
  const { server, origin, combinations: combinationsB } = await startServer(
    combinationsA,
    duration,
  )

  try {
    return await spawnAndMeasure({
      combinations: combinationsB,
      origin,
      duration,
      cwd,
      previewConfig,
      previewState,
      exec,
    })
  } finally {
    await endServer(server)
  }
}
