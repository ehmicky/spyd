import now from 'precise-now'

import { runMeasureLoop } from './loop.js'
import { getLoopBias } from './loop_bias.js'
import { getMinTime } from './min_time.js'
import { getNowBias } from './now_bias.js'

// We run processes until reaching the max `duration`.
// At least one process must be executed.
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to run in parallel but in practice they do
//    impact the performance of each other
//  - this does mean we are under-utilizing CPUs
// eslint-disable-next-line max-lines-per-function
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
  const biasDuration = duration * BIAS_DURATION_RATIO
  const nowBias = await getNowBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration: biasDuration,
    cwd,
    loadDuration,
  })
  const minTime = getMinTime(nowBias, duration)
  const loopBias = await getLoopBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration: biasDuration,
    cwd,
    loadDuration,
    nowBias,
    minTime,
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
