import { OUTLIERS_THRESHOLD } from '../stats/outliers.js'
import { getSortedMedian } from '../stats/quantile.js'

import { measureProcessGroup } from './process_group.js'
import { getResolution } from './resolution.js'

// `measureCost` is the time taken to measure an empty task when `repeat` is `1`
// This includes the time to get the start/end timestamps for example.
// We remove it from the measures so they reflect the real task time with
// accuracy.
// This function estimates `measureCost` by measuring an empty task.
// Those costs must be computed separately for each combination since they
// might vary depending on:
//  - the task. Some runners might allow task-specific configuration impacting
//    measuring. For example, the `node` runner has the `async` configuration
//    property.
//  - the input. The size of the input or whether an input is used or not
//    might impact measuring.
//  - the system. For example, runConfig.
export const getMeasureCost = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  processGroupDuration,
  cwd,
  loadDuration,
}) {
  const { measures } = await measureProcessGroup({
    sampleType: 'measureCost',
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration,
    cwd,
    loadDuration,
    measureCost: 0,
    repeatCost: 0,
    resolution: 1,
    dry: true,
  })
  const measureCost = getSortedMedian(measures, OUTLIERS_THRESHOLD)
  const resolution = getResolution(measures)
  return { measureCost, resolution }
}
