import { setBenchmarkStart } from '../preview/set.js'
import { measureSample } from '../sample/main.js'
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
  combination,
  combination: { taskId },
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
    return { combination, res }
  }

  setBenchmarkStart(previewState)

  return await pWhile(
    ({ combination: combinationA, totalDuration, sampleDurationMean }) =>
      isRemainingCombination({
        combination: combinationA,
        duration,
        exec,
        totalDuration,
        sampleDurationMean,
        stopState,
      }),
    (state) =>
      performSample(state, {
        duration,
        previewConfig,
        previewState,
        stopState,
        server,
        minLoopDuration,
      }),
    { combination, res, totalDuration: 0 },
  )
}

const performSample = async function (
  { combination, res, measureDuration, totalDuration, sampleDurationMean },
  { duration, previewConfig, previewState, stopState, server, minLoopDuration },
) {
  const sampleStart = startSample(stopState, sampleDurationMean)

  updatePreviewEnd({ previewConfig, previewState, duration, totalDuration })

  const {
    combination: combinationA,
    res: resA,
    measureDuration: measureDurationA,
  } = await measureSample({
    combination,
    server,
    res,
    minLoopDuration,
    measureDuration,
  })

  await updatePreviewReport({
    combination: combinationA,
    previewConfig,
    previewState,
  })

  const {
    totalDuration: totalDurationA,
    sampleDurationMean: sampleDurationMeanA,
  } = endSample({
    stopState,
    combination: combinationA,
    sampleStart,
    totalDuration,
  })
  return {
    combination: combinationA,
    res: resA,
    measureDuration: measureDurationA,
    totalDuration: totalDurationA,
    sampleDurationMean: sampleDurationMeanA,
  }
}
