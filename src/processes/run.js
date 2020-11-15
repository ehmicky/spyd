import { promisify } from 'util'

import now from 'precise-now'

import { getBiases } from './bias.js'
import { executeChild } from './execute.js'
import { adjustRepeat } from './repeat.js'

const pSetTimeout = promisify(setTimeout)

// We run child processes until either:
//  - we reach the max `duration`
//  - the `results` size is over `MAX_RESULTS`.
// At least one child must be executed.
// Each child process is aimed at running the same duration (`PROCESS_DURATION`)
//  - this ensures stats are not modified when the `duration` option changes
//  - this also provides with a more frequent reporter live updating
//  - we adjust `PROCESS_DURATION` to run the task at least several times
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
  const { nowBias, loopBias, minTime } = await getBiases({
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    duration,
    cwd,
  })

  const eventPayload = {
    type: 'run',
    taskPath,
    opts: commandOpt,
    taskId,
    inputId,
    nowBias,
    loopBias,
  }
  const { times, count, processes } = await executeChildren({
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    duration,
    runEnd,
    cwd,
    eventPayload,
    loopBias,
    minTime,
  })

  await waitForTimeLeft(runEnd)

  return { times, count, processes }
}

// eslint-disable-next-line max-statements
const executeChildren = async function ({
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  duration,
  runEnd,
  cwd,
  eventPayload,
  loopBias,
  minTime,
}) {
  const times = []
  // eslint-disable-next-line fp/no-let
  let count = 0
  // eslint-disable-next-line fp/no-let
  let processes = 0
  // eslint-disable-next-line fp/no-let
  let processDuration = DEFAULT_PROCESS_DURATION
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    const maxTimes = getMaxTimes(processes)
    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: {
        ...eventPayload,
        duration: processDuration,
        maxTimes,
        repeat,
      },
      timeoutNs: duration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })
    // eslint-disable-next-line fp/no-mutation
    count += childTimes.length * repeat
    // eslint-disable-next-line fp/no-mutation
    processes += 1
    // eslint-disable-next-line fp/no-mutation
    processDuration = adjustDuration(processDuration, childTimes, maxTimes)
    // eslint-disable-next-line fp/no-mutation
    repeat = adjustRepeat({ repeat, childTimes, times, minTime, loopBias })
    // We directly mutate `times` because it's much faster since it's big
    // eslint-disable-next-line fp/no-mutating-methods
    times.push(...childTimes)
  } while (now() + processDuration < runEnd && times.length < MAX_RESULTS)

  return { times, count, processes }
}

// Run increasingly longer children in order to progressively adjust repeat
const getMaxTimes = function (processes) {
  if (processes >= MAX_TIMES_LIMIT) {
    return
  }

  return MAX_TIMES_RATE ** processes
}

const MAX_TIMES_RATE = 2
// Stop increasing once `maxTimes` cannot be represented as a safe integer
// anymore
const MAX_TIMES_LIMIT = Math.log(Number.MAX_SAFE_INTEGER) / Math.log(2)

// 500ms. Chosen:
//   - so that --duration=1 does not timeout
//   - to provide with frequent report live updating
//   - to not be too close to the time to spawn a process (~1ms on my machine)
const DEFAULT_PROCESS_DURATION = 5e8
// Chosen not to overflow the memory of a typical machine
const MAX_RESULTS = 1e8

// If a task is slow enough, each process will run only few loops due to the
// fixed `PROCESS_DURATION`. To reduce variance, we want to run both many loops
// and many processes. To find this equilibrium with slower tasks, we adjust
// `PROCESS_DURATION` when the number of results is too low. We keep increasing
// it until it reaches a target number.
const adjustDuration = function (processDuration, childTimes, maxTimes) {
  if (childTimes.length === maxTimes || childTimes.length >= MIN_LOOPS) {
    return processDuration
  }

  return processDuration * PROCESS_DURATION_GROWTH
}

// The minimum number of loops a process should run.
// A higher number ensures enough loops are run, which reduces variance.
// However, it also increases the difference of stats between runs with
// different `duration` options, since their final `PROCESS_DURATION` might
// be different. It also makes live reporting less responsive.
const MIN_LOOPS = 1e1
// How fast to grow `PROCESS_DURATION` until `MIN_LOOPS` is reached.
// A slow rate is prefered since it will reduce the amount of `waitForTimeLeft`.
const PROCESS_DURATION_GROWTH = 2

// We stop running processes when the next process is most likely to go beyond
// the target `duration`. We do not try to run it with a lower duration since
// this would skew results due to comparing processes with a different number
// of loops.
// However, we still wait for the time left, without running any benchmark.
// This is wasteful time-wise but prevents the timer from jumping fast-forward
// at the end, giving the feeling of a smooth countdown instead
const waitForTimeLeft = async function (runEnd) {
  const timeLeft = (runEnd - now()) / NANOSECS_TO_MSECS

  if (timeLeft <= 0) {
    return
  }

  await pSetTimeout(timeLeft)
}

const NANOSECS_TO_MSECS = 1e6
