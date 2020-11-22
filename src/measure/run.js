import now from 'precise-now'

import { getBiases } from './bias.js'
import { runMeasureLoop } from './loop.js'

// We run processes until reaching the max `duration`.
// At least one process must be executed.
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
  loadDuration,
  duration,
  runEnd,
  cwd,
}) {
  const { nowBias, loopBias, minTime } = await getBiases({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration: duration * BIAS_DURATION_RATIO,
    cwd,
    loadDuration,
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
    loadDuration,
    nowBias,
    loopBias,
    minTime,
    initialRepeat: 1,
    dry: false,
  })
  return { times, count, processes }
}

// Biases must be very precise to benchmark fast tasks accurately.
// So we dedicate a significant part of the total benchmark to them.
const BIAS_DURATION_RATIO = 0.1
