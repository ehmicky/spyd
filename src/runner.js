import { spawn } from 'child_process'

import pEvent from 'p-event'

import { now } from './now.js'
import { getChildMessage, sendChildMessage } from './ipc_helpers.js'

const CHILD_MAIN = `${__dirname}/ipc.js`

const start = async duration => {
  const topStart = startTimer()

  const processDuration = duration / PROCESS_COUNT
  // The last child process will in average spend half of its time beyond the
  // `totalDuration`, so we need to adjust it so the time spent matches
  // the specified `duration`.
  // eslint-disable-next-line no-magic-numbers
  const totalDuration = duration * (1 - 0.5 / PROCESS_COUNT)

  const times = await timedRepeatAsync(
    () => runChild(processDuration),
    totalDuration,
  )

  printStats(times)
  stopTimer(topStart)
}

// This is the maximum number of child processes.
// The actual number might be lower due to the time required to boot child
// processes.
const PROCESS_COUNT = 2e1

// Repeat an async function serially for a specific duration.
// We launch child processes serially, otherwise they slow down each other and
// have higher variance.
const timedRepeatAsync = async function(func, duration) {
  const end = now() + duration

  const results = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const result = await func()
    // eslint-disable-next-line fp/no-mutating-methods
    results.push(result)
  } while (now() < end)

  return results
}

const runChild = async processDuration => {
  const childProcess = await startChild()

  const time = await executeChild(childProcess, processDuration)

  await endChild(childProcess)

  return time
}

const startChild = async function() {
  const childProcess = await spawn(
    'node',
    [CHILD_MAIN],
    // TODO: remove `inherit` on stderr, it's just for debugging
    { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] },
  )

  await getChildMessage(childProcess, 'ready')

  return childProcess
}

const executeChild = async function(childProcess, processDuration) {
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
