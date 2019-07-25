import { spawn } from 'child_process'

import pEvent from 'p-event'
import pMapSeries from 'p-map-series'

import { now } from './now.js'
import { getChildMessage, sendChildMessage } from './ipc_helpers.js'

const CHILD_MAIN = `${__dirname}/child.js`

// Start several child processes benchmarking the same tasks
const start = async function(duration) {
  const runStart = startTimer()

  const childProcesses = await startChildren()

  const runEnd = now() + duration
  const processDuration = getProcessDuration(duration)

  const times = await runChildren(childProcesses, processDuration, runEnd)

  printStats(times)
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

// Maximum number of child processes.
// The actual number might be lower:
//  - the process duration excludes the bias calculation. That bias calculation
//    has a minimum duration which can be relatively huge if the process
//    duration is small.
//  - the task might be relatively slow, i.e. slower than
//    `runDuration / PROCESS_COUNT`
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

// How long to run each child process
const getProcessDuration = function(duration) {
  return Math.max(duration / PROCESS_COUNT, MIN_PROCESS_DURATION)
}

// The actual minimum duration is actually likely to be the bias calculation
// minimum duration.
const MIN_PROCESS_DURATION = 1e7

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
const runChildren = async function(childProcesses, processDuration, runEnd) {
  const results = await pMapSeries(childProcesses, childProcess =>
    runChild(childProcess, processDuration, runEnd),
  )

  const times = results.filter(isDefined)
  return times
}

const runChild = async function(childProcess, processDuration, runEnd) {
  const time = await executeChild(childProcess, processDuration, runEnd)

  await endChild(childProcess)

  return time
}

const executeChild = async function(childProcess, processDuration, runEnd) {
  if (now() > runEnd) {
    return
  }

  await sendChildMessage(childProcess, 'run', processDuration)
  const time = await getChildMessage(childProcess, 'time')
  return time
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

const printStats = function(times) {
  // eslint-disable-next-line fp/no-mutating-methods
  const sortedTimes = times.sort(compareNumbers)

  const timesMedian = sortedTimes[Math.floor(sortedTimes.length / 2)]
  const gap = (sortedTimes[0] - sortedTimes[sortedTimes.length - 1]) / 2
  const gapPercentage = (gap / timesMedian) * 1e2

  console.log(sortedTimes.join('\n'))
  console.log('Median', timesMedian)
  console.log('Gap %', gapPercentage)
}

const compareNumbers = function(numA, numB) {
  return numA < numB ? 1 : -1
}

start(1e9)
