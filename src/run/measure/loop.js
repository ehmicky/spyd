import { getInitialStats, addStats } from '../../stats/add.js'
import { pWhile } from '../../utils/p_while.js'
import { truncateLogs } from '../logs/stream.js'
import { updatePreviewStats } from '../preview/results.js'
import { measureSample } from '../sample/main.js'
import { getInitialSampleState } from '../sample/state.js'

import { getInitialDurationState, startSample, endSample } from './duration.js'
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
export const performMeasureLoop = async function ({
  precisionTarget,
  previewState,
  stopState,
  stage,
  server,
  logsFd,
  minLoopDuration,
}) {
  const { stats } = await pWhile(
    (state) =>
      isRemainingCombination(state, { precisionTarget, stage, stopState }),
    (state) =>
      performSample(state, {
        previewState,
        precisionTarget,
        server,
        minLoopDuration,
        logsFd,
        targetSampleDuration: TARGET_SAMPLE_DURATION,
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

const performSample = async function (
  { sampleState, stats, durationState },
  {
    previewState,
    precisionTarget,
    server,
    minLoopDuration,
    logsFd,
    targetSampleDuration,
  },
) {
  const sampleStart = startSample()

  const sampleStateA = await measureSample(
    { server, minLoopDuration, targetSampleDuration },
    sampleState,
  )
  const statsA = addStats(stats, sampleStateA, minLoopDuration)
  await Promise.all([
    updatePreviewStats({
      stats: statsA,
      previewState,
      durationState,
      precisionTarget,
    }),
    truncateLogs(logsFd),
  ])

  const durationStateA = endSample(sampleStart, durationState, statsA)
  return {
    stats: statsA,
    sampleState: sampleStateA,
    durationState: durationStateA,
  }
}
