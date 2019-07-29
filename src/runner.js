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

  const childProcesses = await startChildren()

  const allStats = await runChildren(childProcesses, processDuration, runEnd)

  printStats(allStats)
  stopTimer(runStart)
}

// We boot all child processes at once in parallel because it is slow.
// We do it before running the benchmarks because it would slow them down and
// add variance.
const startChildren = async function() {
  const promises = Array.from({ length: PROCESS_COUNT }, startChild)
  const childProcesses = await Promise.all(promises)
  return childProcesses
}

// Number of child processes.
// The actual number might be:
//  - lower if the task is slower than `duration / PROCESS_COUNT`.
//  - higher if `duration` is high enough to run `MAX_LOOPS` iterations within
//    each task.
// This is also used as the pool size.
const PROCESS_COUNT = 2e1

const startChild = async function() {
  const childProcess = spawn(
    'node',
    [CHILD_MAIN],
    // TODO: remove `inherit` on stderr, it's just for debugging
    { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] },
  )

  await getChildMessage(childProcess, 'ready')

  return childProcess
}

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
const runChildren = async function(childProcesses, processDuration, runEnd) {
  const results = await pMapSeries(childProcesses, childProcess =>
    runChild(childProcess, processDuration, runEnd),
  )

  const allStats = results.filter(isDefined)
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

const printStats = function(allStats) {
  const sortedTimes = allStats.map(({ median }) => median)
  sortNumbers(sortedTimes)

  const timesMedian = getMedian(sortedTimes)
  const gap = (sortedTimes[sortedTimes.length - 1] - sortedTimes[0]) / 2
  const gapPercentage = (gap / timesMedian) * 1e2

  console.log(sortedTimes.join('\n'))
  console.log('Median', timesMedian)
  console.log('Gap %', gapPercentage)
}

start(2e9)
