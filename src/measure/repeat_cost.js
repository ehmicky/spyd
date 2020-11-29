import { getSortedMedian } from '../stats/median.js'

import { measureProcessGroup } from './process_group.js'
import { getRepeat } from './repeat.js'

// Like `measureCost` but for the time taken to measure an empty task inside a
// `repeat` loop.
// This includes the time to iterate a `while` loop for example.
// This is estimated like `measureCost` except:
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
  measureCost,
  resolution,
}) {
  const initialRepeat = getRepeat({
    repeat: 1,
    median: measureCost,
    repeatCost: 0,
    measureCost,
    resolution,
    processGroupDuration,
  })
  const { measures } = await measureProcessGroup({
    sampleType: 'repeatCost',
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    processGroupDuration,
    cwd,
    loadDuration,
    measureCost,
    repeatCost: 0,
    resolution,
    initialRepeat,
    dry: true,
  })
  const median = getSortedMedian(measures)
  return median
}
