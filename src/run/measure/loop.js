import { addStats, getInitialStats } from '../../stats/add.js'
import { pWhile } from '../../utils/p_while.js'
import { truncateLogs } from '../logs/stream.js'
import { updatePreviewStats } from '../preview/results/main.js'
import { measureSample } from '../sample/main.js'
import { getInitialSampleState } from '../sample/state.js'

import {
  endRunDuration,
  endSample,
  getInitialDurationState,
  startSample,
} from './duration.js'
import { isRemainingCombination } from './remaining.js'

// We break down each combination into samples, i.e. small units of duration
// when measures are taken:
//  - This allows combinations to be previewed at the same time, displaying
//    them competing with each other
//  - This allows some payload properties to be calibrated (e.g. `repeat`)
//  - This helps when stopping benchmarks by allowing samples to end so tasks
//    can be cleaned up
//  - This provides with fast fail if one of the combinations fails
// However, some benchmarks are hard to slice into samples for example when:
//  - They rely on underlying continuous process (e.g. sending and receiving
//    many requests in parallel)
//  - Their beforeEach|afterEach is very slow
// In that case, the task complexity should be increased, for example by using
// bigger `inputs`.
export const performMeasureLoop = async ({
  config: { precision, outliers },
  previewState,
  stopState,
  stage,
  server,
  logsFd,
  minLoopDuration,
  startStat,
}) => {
  const { stats } = await pWhile(
    (state) => isRemainingCombination(state, { precision, stage, stopState }),
    (state) =>
      performSample(state, {
        previewState,
        precision,
        outliers,
        server,
        minLoopDuration,
        logsFd,
        targetSampleDuration: TARGET_SAMPLE_DURATION,
        startStat,
      }),
    {
      stats: getInitialStats(),
      sampleState: getInitialSampleState(),
      durationState: getInitialDurationState(),
    },
  )
  return stats
}

export const TARGET_SAMPLE_DURATION = 1e8

const performSample = async (
  { sampleState, stats, durationState },
  {
    previewState,
    precision,
    outliers,
    server,
    minLoopDuration,
    logsFd,
    targetSampleDuration,
    startStat,
  },
) => {
  const sampleStart = startSample()

  const sampleStateA = await measureSample(
    { server, minLoopDuration, targetSampleDuration },
    sampleState,
  )
  const { stats: statsA, sampleState: sampleStateB } = addStats({
    stats,
    sampleState: sampleStateA,
    minLoopDuration,
    outliers,
    precision,
  })
  const statsB = endRunDuration(startStat, statsA)
  await Promise.all([
    updatePreviewStats({
      stats: statsB,
      previewState,
      durationState,
      sampleState: sampleStateB,
      precision,
    }),
    truncateLogs(logsFd),
  ])

  const durationStateA = endSample(sampleStart, durationState, statsB)
  return {
    stats: statsB,
    sampleState: sampleStateB,
    durationState: durationStateA,
  }
}
