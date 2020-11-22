import { getBiases } from './bias.js'
import { executeChildren } from './child.js'

// We run child processes until either:
//  - we reach the max `duration`
//  - the `results` size is over `MAX_TIMES`.
// At least one child must be executed.
// Each child process is aimed at running the same duration (`maxDuration`)
//  - this ensures stats are not modified when the `duration` option changes
//  - this also provides with a more frequent reporter live updating
//  - we adjust `maxDuration` to run the task at least several times
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to run in parallel but in practice they do
//    impact the performance of each other
//  - this does mean we are under-utilizing CPUs
export const runChildren = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  duration,
  runEnd,
  cwd,
}) {
  const { benchmarkCost, nowBias, loopBias, minTime } = await getBiases({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })

  const { times, count, processes } = await executeChildren({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    runEnd,
    cwd,
    benchmarkCost,
    nowBias,
    loopBias: 0.41,
    minTime,
  })

  return { times, count, processes }
}
