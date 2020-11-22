import { promisify } from 'util'

import now from 'precise-now'

import { getStats } from '../stats/compute.js'

import { measureCombination } from './combination.js'

const pSetTimeout = promisify(setTimeout)

// Start several child processes measuring the same task.
// eslint-disable-next-line max-lines-per-function
export const getCombinationResult = async function ({
  row,
  column,
  taskPath,
  taskId,
  taskTitle,
  inputId,
  inputTitle,
  commandRunner,
  commandId,
  commandTitle,
  commandDescription,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  systemId,
  systemTitle,
  loadDuration,
  index,
  progressState,
  opts: { duration, cwd },
}) {
  const runEnd = now() + duration

  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { row, index, runEnd })

  const { times, count, processes } = await measureCombination({
    taskPath,
    taskId,
    inputId,
    commandSpawn,
    commandSpawnOptions,
    commandOpt,
    loadDuration,
    duration,
    runEnd,
    cwd,
  })

  const stats = getStats({ times, count, processes })

  await waitForTimeLeft(runEnd)

  return {
    row,
    column,
    taskId,
    taskTitle,
    inputId,
    inputTitle,
    commandRunner,
    commandId,
    commandTitle,
    commandDescription,
    systemId,
    systemTitle,
    stats,
  }
}

// We stop measuring processes when the next process is most likely to go beyond
// the target `duration`. We do not try to measure it with a lower duration
// since this would skew results due to comparing processes with a different
// number of loops.
// However, we still wait for the time left, without spawning any processes.
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
