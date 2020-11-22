import now from 'precise-now'

import { executeChild } from '../processes/main.js'
import { removeOutliers } from '../stats/outliers.js'

import { getMedian } from './median.js'
import { normalizeTimes } from './normalize.js'
import { adjustRepeat } from './repeat.js'

// eslint-disable-next-line max-statements, max-lines-per-function
export const runMeasureLoop = async function ({
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  measureDuration,
  cwd,
  benchmarkCost,
  benchmarkCostMin,
  nowBias,
  loopBias,
  minTime,
  dry,
}) {
  const runEnd = now() + measureDuration
  const eventPayload = {
    type: 'run',
    opts: commandOpt,
    taskPath,
    taskId,
    inputId,
    dry,
  }
  const results = []
  // eslint-disable-next-line fp/no-let
  let totalTimes = 0
  const processMedians = []
  // eslint-disable-next-line fp/no-let
  let median = 0
  // eslint-disable-next-line fp/no-let
  let repeat = 1

  // eslint-disable-next-line fp/no-loops
  do {
    const timeLeft = runEnd - now()
    const maxTimeLeftMeasuring = timeLeft - benchmarkCost
    const maxDuration = Math.min(benchmarkCostMin, maxTimeLeftMeasuring)

    // eslint-disable-next-line no-await-in-loop
    const { times: childTimes } = await executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, maxDuration, repeat },
      timeoutNs: measureDuration,
      cwd,
      taskId,
      inputId,
      type: 'iterationRun',
    })
    normalizeTimes(childTimes, { nowBias, loopBias, repeat })

    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ childTimes, repeat })
    // eslint-disable-next-line fp/no-mutation
    totalTimes += childTimes.length

    // eslint-disable-next-line fp/no-mutation
    median = getMedian(childTimes, processMedians)
    // eslint-disable-next-line fp/no-mutation
    repeat = adjustRepeat({ repeat, minTime, loopBias, median })
  } while (
    now() + benchmarkCost + nowBias + median < runEnd &&
    totalTimes < TOTAL_MAX_TIMES
  )

  const { times, count, processes } = removeOutliers(results)
  return { times, count, processes }
}

// Chosen not to overflow the memory of a typical machine
const TOTAL_MAX_TIMES = 1e8
