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
  cwd,
}) {
  const {
    measures,
    processes,
    loops,
    times,
    loadCost,
    minLoopDuration,
  } = await measureProcessGroup({
    sampleType: 'measureTask',
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandConfig,
    runnerRepeats,
    processGroupDuration: duration,
    cwd,
    loadDuration,
    dry: false,
  })
  return { measures, processes, loops, times, minLoopDuration, loadCost }
}
