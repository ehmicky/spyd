import { execFile } from 'child_process'
import { promisify } from 'util'

import { now } from './now.js'

const LAUNCHER = `${__dirname}/launch.js`

const pExecFile = promisify(execFile)

const start = async duration => {
  const topStart = startTimer()

  const processDuration = duration / PROCESS_COUNT
  // The last child process will in average spend half of its time beyond the
  // `totalDuration`, so we need to adjust it so the time spent matches
  // the specified `duration`.
  // eslint-disable-next-line no-magic-numbers
  const totalDuration = duration * (1 - 0.5 / PROCESS_COUNT)

  const times = await timedRepeatAsync(
    () => launch(processDuration),
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

const launch = async processDuration => {
  const { stdout, stderr } = await pExecFile('node', [
    LAUNCHER,
    processDuration,
  ])

  // TODO: remove
  if (stderr.trim()) {
    console.log(stderr)
  }

  const time = Number(stdout.trim())
  return time
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

start(1e10)
