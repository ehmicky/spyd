import { getSortedMedian } from '../stats/median.js'

import { runMeasureLoop } from './loop.js'
import { getRepeat } from './repeat.js'

// Like `nowBias` but for the time taken to run an empty task inside a `repeat`
// loop.
// This includes the time to iterate a `while` loop for example.
// This is estimated like `nowBias` except:
//  - using the normal `repeat` logic (instead of forcing it to `1`)
//  - estimates the initial `repeat` to reduce the number of processes needed
//    to compute the optimal `repeat`
export const getLoopBias = async function ({
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
