import { now } from '../now.js'
import { getStats } from '../stats/compute.js'

import { startChildren } from './start.js'
import { runChildren } from './run.js'
import { shouldStop } from './stop.js'

// Start several child processes benchmarking the same task.
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

  const results = await runPools({
    taskPath,
    taskId,
    parameter,
    processDuration,
    runEnd,
  })

  const benchmark = getBenchmark({ results, parameter, title })
  return benchmark
}

const PROCESS_COUNT = 2e1

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once we
// reach `MAX_RESULTS` though.
const runPools = async function({
  taskPath,
  taskId,
  parameter,
  processDuration,
  runEnd,
}) {
  const results = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const poolResults = await runPool({
      taskPath,
      taskId,
      parameter,
      processDuration,
      runEnd,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    results.push(...poolResults)
  } while (!shouldStop(runEnd, results))

  return results
}

const runPool = async function({
  taskPath,
  taskId,
  parameter,
  processDuration,
  runEnd,
}) {
  try {
    const children = await startChildren({ taskPath, taskId, parameter })
    const results = await runChildren({ children, processDuration, runEnd })
    return results
  } catch (error) {
    addTaskInfo({ error, taskId, parameter })
    throw error
  }
}

// When a task errors, communicate to user which one failed
const addTaskInfo = function({ error, taskId, parameter }) {
  const parameterStr =
    parameter === undefined ? '' : ` (parameter '${parameter}')`
  const message = error instanceof Error ? error.message : String(error)
  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  error.message = `Task '${taskId}'${parameterStr} errored:\n\n${message}`
}

// Convert results to `benchmark` object passed to reporters
const getBenchmark = function({ results, parameter, title }) {
  const stats = getStats(results)
  return { task: title, parameter, stats }
}
