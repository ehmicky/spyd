/* eslint-disable max-lines */
import { getSortedMedian } from '../stats/median.js'

import { runMeasureLoop } from './loop.js'
import { getMinTime } from './min_time.js'
import { getRepeat } from './repeat.js'

export const getBiases = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  loadDuration,
}) {
  const nowBias = await getNowBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration,
    cwd,
    loadDuration,
  })
  const minTime = getMinTime(nowBias)
  const loopBias = await getLoopBias({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration,
    cwd,
    loadDuration,
    nowBias,
    minTime,
  })
  return { nowBias, loopBias, minTime }
}

// `nowBias` is the time taken to run an empty task when `repeat` is `1`.
// This includes the time to get the start/end timestamps for example.
// We remove it from the benchmark times so they reflect the real task time
// with accuracy.
// This function estimates `nowBias` by benchmarking an empty task.
// Those biases must be computed separately for each iteration since they might
// vary depending on:
//  - the task. Some runners might allow task-specific options impacting
//    benchmarking. For example, the `node` runner has the `async` option.
//  - the input. The size of the input or whether an input is used or not
//    might impact benchmarking.
//  - the system. For example, runner options.
const getNowBias = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  loadDuration,
}) {
  const { times } = await runMeasureLoop({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration,
    cwd,
    loadDuration,
    nowBias: 0,
    loopBias: 0,
    minTime: 0,
    initialRepeat: 1,
    dry: true,
  })
  const median = getSortedMedian(times)
  return median
}

// Like `nowBias` but for the time taken to run an empty task inside a `repeat`
// loop.
// This includes the time to iterate a `while` loop for example.
// This is estimated like `nowBias` except:
//  - using the normal `repeat` logic (instead of forcing it to `1`)
//  - estimates the initial `repeat` to reduce the number of processes needed
//    to compute the optimal `repeat`
const getLoopBias = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  loadDuration,
  nowBias,
  minTime,
}) {
  const initialRepeat = getRepeat({
    repeat: 1,
    minTime,
    loopBias: 0,
    median: nowBias,
  })
  const { times } = await runMeasureLoop({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    measureDuration,
    cwd,
    loadDuration,
    nowBias,
    loopBias: 0,
    minTime,
    initialRepeat,
    dry: true,
  })
  const median = getSortedMedian(times)
  return median
}
/* eslint-enable max-lines */
