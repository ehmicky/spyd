import { setBenchmarkStart } from '../preview/set.js'
import { measureSample } from '../sample/main.js'
import { getInitialStats, getInitialSampleState } from '../sample/state.js'
import { pWhile } from '../utils/p_while.js'

import { startSample, endSample } from './duration.js'
import { updatePreviewEnd } from './preview_end.js'
import { updatePreviewReport } from './preview_report.js'
import { isRemainingCombination } from './remaining.js'

// We break down each combination into samples, i.e. small units of duration
// when measures are taken:
//  - This allows combinations to be previewed at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be calibrated (e.g. `repeat`)
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
  taskId,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
  res,
  minLoopDuration,
}) {
  if (taskId === undefined) {
    return { res, sampleState: {} }
  }

  setBenchmarkStart(previewState)

  const stats = getInitialStats()
  const sampleState = getInitialSampleState()
  const { res: resA, stats: statsA } = await pWhile(
    (state) => isRemainingCombination(state, { duration, exec, stopState }),
    (state) =>
      performSample(state, {
        duration,
        previewConfig,
        previewState,
        stopState,
        server,
        minLoopDuration,
      }),
    { res, stats, sampleState },
  )
  return { res: resA, stats: statsA }
}

const performSample = async function (
  { res, sampleState, stats },
  { duration, previewConfig, previewState, stopState, server, minLoopDuration },
) {
  const sampleStart = startSample(stopState, sampleState)

  updatePreviewEnd({ previewConfig, previewState, sampleState, duration })

  const {
    res: resA,
    stats: statsA,
    sampleState: sampleStateA,
  } = await measureSample({
    stats,
    sampleState,
    server,
    res,
    minLoopDuration,
  })

  await updatePreviewReport({
    stats: statsA,
    sampleState: sampleStateA,
    previewConfig,
    previewState,
  })

  const sampleStateB = endSample({
    stopState,
    sampleState: sampleStateA,
    sampleStart,
  })
  return { res: resA, stats: statsA, sampleState: sampleStateB }
}
