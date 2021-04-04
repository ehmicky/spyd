import { setBenchmarkStart } from '../preview/set.js'
import { measureSample } from '../sample/main.js'
import { pWhile } from '../utils/p_while.js'

import { aggregatePreview } from './aggregate.js'
import { getSampleStart, addSampleDuration } from './duration.js'
import { updatePreviewEnd } from './preview_end.js'
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

  const { combination: combinationB, res: resA } = await pWhile(
    ({ combination: combinationA }) =>
      isRemainingCombination({
        combination: combinationA,
        duration,
        exec,
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
    { combination, res },
  )

  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.combination
  return { combination: combinationB, res: resA }
}

const performSample = async function (
  { combination, res },
  { duration, previewConfig, previewState, stopState, server, minLoopDuration },
) {
  const sampleStart = getSampleStart()
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.sampleStart = sampleStart

  updatePreviewEnd({
    combination,
    previewConfig,
    previewState,
    duration,
  })

  const { combination: combinationA, res: resA } = await measureSample({
    combination,
    server,
    res,
    minLoopDuration,
  })

  const combinationB = await aggregatePreview({
    combination: combinationA,
    previewConfig,
    previewState,
    minLoopDuration,
  })

  const combinationC = addSampleDuration(combinationB, sampleStart)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.combination = combinationC

  return { combination: combinationC, res: resA }
}
