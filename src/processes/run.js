import pReduce from 'p-reduce'

import { now } from '../now.js'

import { getChildMessage, sendChildMessage } from './ipc.js'
import { endChild } from './end.js'

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
export const runChildren = function({
  children,
  processDuration,
  runEnd,
  taskId,
  variationId,
}) {
  return pReduce(
    children,
    (results, child) =>
      runChild({
        child,
        processDuration,
        runEnd,
        taskId,
        variationId,
        results,
      }),
    [],
  )
}

const runChild = async function({
  child,
  processDuration,
  runEnd,
  taskId,
  variationId,
  results,
}) {
  const resultsA = await executeChild({
    child,
    processDuration,
    runEnd,
    taskId,
    variationId,
    results,
  })

  endChild(child)

  return resultsA
}

const executeChild = async function({
  child,
  processDuration,
  runEnd,
  taskId,
  variationId,
  results,
}) {
  // Ensure at least one child process is executed
  if (now() > runEnd && results.length !== 0) {
    return results
  }

  // Tell the child process to start benchmarking
  await sendChildMessage(child, 'run', {
    taskId,
    variationId,
    duration: processDuration,
  })

  // Wait for the benchmark result
  const { times, count } = await getChildMessage(child, 'run')
  return [...results, { times, count }]
}
