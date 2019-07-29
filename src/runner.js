import { spawn } from 'child_process'

import pEvent from 'p-event'
import pMapSeries from 'p-map-series'

import { now } from './now.js'
import { getChildMessage, sendChildMessage } from './ipc_helpers.js'
import { sortNumbers, getMedian } from './stats.js'

const CHILD_MAIN = `${__dirname}/child.js`

// Start several child processes benchmarking the same tasks
const start = async function(duration) {
  const runStart = startTimer()

  const runEnd = now() + duration
  // How long to run each child process
  const processDuration = duration / PROCESS_COUNT

  const results = await runChildren(processDuration, runEnd)

  printStats(results)
  stopTimer(runStart)
}

const PROCESS_COUNT = 2e1

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes.
const runChildren = async function(processDuration, runEnd) {
  const allResults = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const pool = await startPool()
    // eslint-disable-next-line no-await-in-loop
    const results = await runPool(pool, processDuration, runEnd)
    // eslint-disable-next-line fp/no-mutating-methods
    allResults.push(...results)
  } while (now() <= runEnd)

  const allResultsA = allResults.filter(isDefined)
  return allResultsA
}

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
const runPool = async function(pool, processDuration, runEnd) {
  const allStats = await pMapSeries(pool, childProcess =>
    runChild(childProcess, processDuration, runEnd),
  )
  return allStats
}

const runChild = async function(childProcess, processDuration, runEnd) {
  const stats = await executeChild(childProcess, processDuration, runEnd)

  await endChild(childProcess)

  return stats
}

const executeChild = async function(childProcess, processDuration, runEnd) {
  if (now() > runEnd) {
    return
  }

  await sendChildMessage(childProcess, 'run', processDuration)
  const stats = await getChildMessage(childProcess, 'stats')
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

const printStats = function(results) {
  const sortedTimes = results.map(({ median }) => median)
  sortNumbers(sortedTimes)

  const timesMedian = getMedian(sortedTimes)
  const gap = (sortedTimes[sortedTimes.length - 1] - sortedTimes[0]) / 2
  const gapPercentage = (gap / timesMedian) * 1e2

  console.log(sortedTimes.join('\n'))
  console.log('Median', timesMedian)
  console.log('Gap %', gapPercentage)
}

start(2e9)
