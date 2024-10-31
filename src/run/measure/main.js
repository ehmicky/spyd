import pMapSeries from 'p-map-series'

import { addStopHandler, removeStopHandler } from '../stop/main.js'

import { endServer, startServer } from './server.js'
import { measureCombination } from './single.js'

// Measure all combinations and add results to `combinations`.
// Also used when starting combinations to retrieve their tasks and steps.
export const measureCombinations = async (combinations, args) => {
  const stopState = await addStopHandler(args.previewState)

  try {
    return await startServerAndMeasure({ ...args, combinations, stopState })
  } finally {
    removeStopHandler(stopState)
  }
}

// Start server to communicate with combinations, then measure them.
const startServerAndMeasure = async (args) => {
  const { server, serverUrl } = await startServer()

  try {
    return await measureEachCombination({ ...args, server, serverUrl })
  } finally {
    await endServer(server)
  }
}

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
const measureEachCombination = async ({ combinations, ...args }) =>
  await pMapSeries(
    combinations,
    (combination, index) => measureCombination({ ...args, combination, index }),
    [],
  )
