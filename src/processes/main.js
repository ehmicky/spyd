import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { startChildren } from './start.js'
import { runChildren } from './run.js'
import { shouldStop } from './stop.js'

// Start several child processes benchmarking the same task
// Each task (and parameter combination) is run serially to avoid influencing
// the timing of another.
export const runProcesses = async function({
  taskPath,
  taskId,
  title,
  parameter,
  duration,
}) {
  const runEnd = now() + duration
  // How long to run each child process
  const processDuration = duration / PROCESS_COUNT

  const { results, processes } = await runPools({
    taskPath,
    taskId,
    parameter,
    processDuration,
    runEnd,
  })

  const benchmark = getBenchmark({ results, processes, parameter, title })
  return benchmark
}

const PROCESS_COUNT = 2e1

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once
// reaching `MAX_RESULTS` though.
const runPools = async function({
  taskPath,
  taskId,
  parameter,
  processDuration,
  runEnd,
}) {
  const results = []
  const processCount = { value: 0 }

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    await runPool({
      taskPath,
      taskId,
      parameter,
      processDuration,
      runEnd,
      processCount,
      results,
    })
  } while (!shouldStop(runEnd, results))

  return { results, processes: processCount.value }
}

const runPool = async function({
  taskPath,
  taskId,
  parameter,
  processDuration,
  runEnd,
  processCount,
  results,
}) {
  const children = await startChildren({ taskPath, taskId, parameter })

  const poolResults = await runChildren(
    children,
    processDuration,
    runEnd,
    processCount,
  )

  // eslint-disable-next-line fp/no-mutating-methods
  results.push(...poolResults)
}

const getBenchmark = function({ results, processes, parameter, title }) {
  const stats = getStats(results, processes)
  return { task: title, parameter, stats }
}
