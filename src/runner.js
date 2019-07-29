import { spawn } from 'child_process'

import pEvent from 'p-event'
import pMapSeries from 'p-map-series'

import { now } from './now.js'
import { getChildMessage, sendChildMessage } from './ipc_helpers.js'
import { mergeStats } from './stats.js'
import { printStats } from './print.js'

const CHILD_MAIN = `${__dirname}/child.js`

// Start several child processes benchmarking the same tasks
const start = async function(duration) {
  const runStart = startTimer()

  const runEnd = now() + duration
  // How long to run each child process
  const processDuration = duration / PROCESS_COUNT

  const { results, processes } = await runChildren(processDuration, runEnd)

  printResults(results, processes)
  stopTimer(runStart)
}

const PROCESS_COUNT = 2e1

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once
// reaching `MAX_RESULTS` though.
const runChildren = async function(processDuration, runEnd) {
  const allResults = []
  const processCount = { value: 0 }

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const pool = await startPool()
    // eslint-disable-next-line no-await-in-loop
    const results = await runPool(pool, processDuration, runEnd, processCount)
    // eslint-disable-next-line fp/no-mutating-methods
    allResults.push(...results)
  } while (!shouldStop(runEnd, allResults))

  const allResultsA = allResults.filter(isDefined)
  return { results: allResultsA, processes: processCount.value }
}

const shouldStop = function(runEnd, results) {
  return now() > runEnd || isOverMaxLoops(results)
}

// We limit the size of the `results` in order to avoid crashing the process
// due to memory limits
const isOverMaxLoops = function(results) {
  const resultsSize = results.reduce(addLoops, 0)
  return resultsSize >= MAX_RESULTS
}

const addLoops = function(total, { loops }) {
  return total + loops
}

const MAX_RESULTS = 1e8

// We boot several child processes at once in parallel because it is slow.
// We do it in-between benchmarks because it would slow them down and add
// variance.
const startPool = async function() {
  const promises = Array.from({ length: POOL_SIZE }, startChild)
  const childProcesses = await Promise.all(promises)
  return childProcesses
}

const POOL_SIZE = PROCESS_COUNT

const startChild = async function() {
  const childProcess = spawn('node', [CHILD_MAIN], {
    stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
  })

  await getChildMessage(childProcess, 'ready')

  return childProcess
}

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
const runPool = async function(pool, processDuration, runEnd, processCount) {
  const allStats = await pMapSeries(pool, childProcess =>
    runChild(childProcess, processDuration, runEnd, processCount),
  )
  return allStats
}

const runChild = async function(
  childProcess,
  processDuration,
  runEnd,
  processCount,
) {
  const stats = await executeChild(
    childProcess,
    processDuration,
    runEnd,
    processCount,
  )

  await endChild(childProcess)

  return stats
}

const executeChild = async function(
  childProcess,
  processDuration,
  runEnd,
  processCount,
) {
  if (now() > runEnd) {
    return
  }

  await sendChildMessage(childProcess, 'run', processDuration)
  const stats = await getChildMessage(childProcess, 'stats')

  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  processCount.value += 1

  return stats
}

const endChild = async function(childProcess) {
  childProcess.disconnect()

  const [exitCode, signal] = await pEvent(childProcess, 'exit', {
    multiArgs: true,
  })

  if (exitCode !== 0) {
    throw new Error(`Child process exited with code ${exitCode}`)
  }

  if (signal !== null) {
    throw new Error(`Child process exited with signal '${signal}'`)
  }
}

const isDefined = function(value) {
  return value !== undefined
}

const startTimer = function() {
  return now()
}

const stopTimer = function(topStart) {
  const topEnd = now()
  const topTime = (topEnd - topStart) / 1e9
  console.log('Time', topTime)
}

const printResults = function(results, processes) {
  const stats = mergeStats(results)
  printStats({ ...stats, processes })
}

start(2e9)
