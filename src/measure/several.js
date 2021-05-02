import pMapSeries from 'p-map-series'

import { hasLogs } from '../logs/create.js'
import {
  startCombinationPreview,
  endCombinationPreview,
} from '../preview/combination.js'
import { updateDescription } from '../preview/description.js'
import { startServer, endServer } from '../server/main.js'
import { addStopHandler, removeStopHandler } from '../stop/main.js'

import { logAndMeasure } from './single.js'
import { spawnAndMeasure } from './spawn.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
// Combinations are measured serially:
//  - Running them concurrently decreases the precision due to sharing the same
//    machine and OS. This is the case even when samples are run one at a time:
//     - Roughly doubles stdev
//     - Changes the distribution of each combination
//     - Increases `minLoopDuration` due to processes being spawned in parallel
//  - This lowers the maximum memory usage since only one combination's
//    `measures` is in memory at a time
//  - The downside is that users do not get early results of all combinations
//    at once. However, the `precision` configuration property can be used for
//    this.
export const measureCombinations = async function (
  combinations,
  { precisionTarget, cwd, previewState, stage },
) {
  const stopState = addStopHandler(previewState)

  try {
    return await startServerAndMeasure({
      combinations,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      stage,
    })
  } finally {
    removeStopHandler(stopState)
  }
}

// Start server to communicate with combinations, then measure them.
const startServerAndMeasure = async function ({
  combinations,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  stage,
}) {
  const { server, serverUrl } = await startServer()

  try {
    return await measureCombinationsStats({
      combinations,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      stage,
      server,
      serverUrl,
    })
  } finally {
    await endServer(server)
  }
}

const measureCombinationsStats = async function ({
  combinations,
  precisionTarget,
  cwd,
  previewState,
  stopState,
  stage,
  server,
  serverUrl,
}) {
  return await pMapSeries(
    combinations,
    (combination, index) =>
      measureCombinationStats({
        combination,
        index,
        previewState,
        stopState,
        precisionTarget,
        cwd,
        stage,
        server,
        serverUrl,
      }),
    [],
  )
}

const measureCombinationStats = async function ({
  combination,
  index,
  previewState,
  stopState,
  precisionTarget,
  cwd,
  stage,
  server,
  serverUrl,
}) {
  try {
    await startCombinationPreview(previewState, combination, index)
    const nextFunction = hasLogs(stage) ? logAndMeasure : spawnAndMeasure
    const { stats, taskIds } = await nextFunction({
      combination,
      precisionTarget,
      cwd,
      previewState,
      stopState,
      stage,
      server,
      serverUrl,
    })
    await endCombinationPreview(previewState)
    return { ...combination, stats, taskIds }
  } finally {
    await updateDescription(previewState, '')
  }
}
