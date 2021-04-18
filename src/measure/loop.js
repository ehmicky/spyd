import { measureSample } from '../sample/main.js'
import { getInitialSampleState } from '../sample/state.js'
import { getInitialStats, addStats } from '../stats/add.js'
import { pWhile } from '../utils/p_while.js'

import { getInitialDurationState, startSample, endSample } from './duration.js'
import { updateCombinationPreview } from './preview_duration.js'
import { updatePreviewReport } from './preview_report.js'
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
// In that case, the benchmark should rely on a maximum count/size instead of
// a maximum duration, as opposed to duration-based samples
//  - For this type of benchmark, the `duration` can be set to `1` to run only
//    one sample.
//  - The user must then ensures the task has some big enough input to process.
//  - This can be either hardcoded or using the `inputs` configuration property.
export const performMeasureLoop = async function ({
  duration,
  precision = duration,
  previewConfig,
  previewState,
  stopState,
  stage,
  server,
  minLoopDuration,
}) {
  const initialState = getInitialState()
  const { stats } = await pWhile(
    (state) => isRemainingCombination(state, { precision, stage, stopState }),
    (state) =>
      performSample(state, {
        precision,
        previewConfig,
        previewState,
        stopState,
        server,
        minLoopDuration,
        targetSampleDuration: TARGET_SAMPLE_DURATION,
      }),
    initialState,
  )
  return stats
}

export const TARGET_SAMPLE_DURATION = 1e8

const getInitialState = function () {
  const stats = getInitialStats()
  const sampleState = getInitialSampleState()
  const durationState = getInitialDurationState()
  return { stats, sampleState, durationState }
}

const performSample = async function (
  { sampleState, stats, durationState },
  {
    precision,
    previewConfig,
    previewState,
    stopState,
    server,
    minLoopDuration,
    targetSampleDuration,
  },
) {
  const sampleStart = startSample(stopState, durationState)

  updateCombinationPreview({
    stats,
    previewConfig,
    previewState,
    durationState,
    precision,
  })

  const sampleStateA = await measureSample(
    { server, minLoopDuration, targetSampleDuration },
    sampleState,
  )
  const statsA = addStats(stats, sampleStateA, minLoopDuration)

  await updatePreviewReport({
    stats: statsA,
    sampleState: sampleStateA,
    previewConfig,
    previewState,
  })

  const durationStateA = endSample({
    durationState,
    sampleState: sampleStateA,
    sampleStart,
    stopState,
  })
  return {
    stats: statsA,
    sampleState: sampleStateA,
    durationState: durationStateA,
  }
}
