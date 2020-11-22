import { getSortedMedian } from '../stats/median.js'

import { measureProcessGroup } from './process_group.js'
import { getRepeat } from './repeat.js'

// Like `nowBias` but for the time taken to measure an empty task inside a
// `repeat` loop.
// This includes the time to iterate a `while` loop for example.
// This is estimated like `nowBias` except:
//  - using the normal `repeat` logic (instead of forcing it to `1`)
//  - estimates the initial `repeat` to reduce the number of processes needed
//    to compute the optimal `repeat`
export const getRepeatCost = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  processGroupDuration,
  cwd,
  loadDuration,
  nowBias,
  minLoopTime,
}) {
  const initialRepeat = getRepeat({
    repeat: 1,
    minLoopTime,
    repeatCost: 0,
    median: nowBias,
  })
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
    nowBias,
    repeatCost: 0,
    minLoopTime,
    initialRepeat,
    dry: true,
  })
  const median = getSortedMedian(times)
  return median
}
