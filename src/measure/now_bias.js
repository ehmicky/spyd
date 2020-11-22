import { getSortedMedian } from '../stats/median.js'

import { measureProcessGroup } from './loop.js'

// `nowBias` is the time taken to measure an empty task when `repeat` is `1`.
// This includes the time to get the start/end timestamps for example.
// We remove it from the measures so they reflect the real task time with
// accuracy.
// This function estimates `nowBias` by measuring an empty task.
// Those biases must be computed separately for each combination since they
// might vary depending on:
//  - the task. Some runners might allow task-specific options impacting
//    measuring. For example, the `node` runner has the `async` option.
//  - the input. The size of the input or whether an input is used or not
//    might impact measuring.
//  - the system. For example, runner options.
export const getNowBias = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  processGroupDuration,
  cwd,
  loadDuration,
}) {
  const { times } = await measureProcessGroup({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    processGroupDuration,
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
