import now from 'precise-now'

import { getBiases } from './bias.js'
import { getBenchmarkCostMin } from './cost.js'
import { runMeasureLoop } from './loop.js'

// We run child processes until either:
//  - we reach the max `duration`
//  - the `results` size is over `TOTAL_MAX_TIMES`.
// At least one child must be executed.
// Each child process is aimed at running the same duration (`maxDuration`)
//  - this ensures stats are not modified when the `duration` option changes
//  - this also provides with a more frequent reporter live updating
//  - we adjust `maxDuration` to run the task at least several times
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to run in parallel but in practice they do
//    impact the performance of each other
//  - this does mean we are under-utilizing CPUs
export const runMeasurement = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  runEnd,
  cwd,
}) {
  const benchmarkCostMin = await getBenchmarkCostMin({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })
  const { nowBias, loopBias, minTime } = await getBiases({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration: duration * BIAS_DURATION_RATIO,
    cwd,
    benchmarkCostMin,
  })
  const { times, count, processes } = await runMeasureLoop({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration: runEnd - now(),
    cwd,
    benchmarkCostMin,
    nowBias,
    loopBias,
    minTime,
    dry: false,
  })
  return { times, count, processes }
}

// Biases must be very precise to benchmark fast tasks accurately.
// So we dedicate a significant part of the total benchmark to them.
const BIAS_DURATION_RATIO = 0.1
