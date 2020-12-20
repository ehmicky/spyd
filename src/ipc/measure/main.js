import { promisify } from 'util'

import now from 'precise-now'

import { measureProcessGroup } from './process_group.js'

const pSetTimeout = promisify(setTimeout)

// Start several child processes measuring the same task.
export const getCombinationResult = async function ({
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
  runnerRepeats,
  systemId,
  systemTitle,
  index,
  progressState,
  benchmarkEnd,
}) {
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { row, index, benchmarkEnd })

  const { measures, sampleState } = await measureProcessGroup(runnerRepeats)

  await waitForTimeLeft(benchmarkEnd)

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

// We stop measuring when the next sample is most likely to go beyond the target
// `duration`.
// We still wait for the time left. This wastes some time but prevents the
// progress timer from jumping fast-forward at the end, giving the feeling of a
// smooth countdown instead.
const waitForTimeLeft = async function (benchmarkEnd) {
  const timeLeft = (benchmarkEnd - now()) / NANOSECS_TO_MSECS

  if (timeLeft <= 0) {
    return
  }

  await pSetTimeout(timeLeft)
}

const NANOSECS_TO_MSECS = 1e6
