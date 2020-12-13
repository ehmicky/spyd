import now from 'precise-now'

import { getMinLoopDuration } from './min_loop_duration.js'
import { measureProcessGroup } from './process_group.js'

// We measure by spawning processes until reaching the max `duration`.
// At least one process must be executed.
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to execute in parallel but in practice they
//    do impact the performance of each other
//  - this does mean we are under-utilizing CPUs
export const measureCombination = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  loadDuration,
  duration,
  combinationEnd,
  cwd,
}) {
  const costDuration = duration * COST_DURATION_RATIO
  const minLoopDuration = await getMinLoopDuration({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration: costDuration,
    cwd,
    loadDuration,
  })
  const { measures, times, processes, loadCost } = await measureProcessGroup({
    sampleType: 'measureTask',
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration: combinationEnd - now(),
    cwd,
    loadDuration,
    minLoopDuration,
    dry: false,
  })
  return { measures, times, processes, minLoopDuration, loadCost }
}

// Cost estimates must be very precise to measure fast tasks accurately.
// So we dedicate a significant part of the total combination to them.
const COST_DURATION_RATIO = 0.1
