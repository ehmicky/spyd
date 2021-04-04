import { setBenchmarkStart } from '../preview/set.js'
import { measureSample } from '../sample/main.js'

import { aggregatePreview, aggregateMeasures } from './aggregate.js'
import { getSampleStart, addSampleDuration } from './duration.js'
import { updatePreviewEnd } from './preview_end.js'
import { isRemainingCombination } from './remaining.js'

// Run samples to measure each combination.
// We ensure combinations are never measured at the same time
//  - Otherwise, they would compete for memory and CPU, making results less
//    precise.
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
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
// eslint-disable-next-line max-statements, max-lines-per-function
export const performMeasureLoop = async function ({
  combinations,
  combination,
  combination: { index, taskId },
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
  server,
  res,
}) {
  if (taskId === undefined) {
    return { combination, res }
  }

  setBenchmarkStart(previewState)

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.combination = combination
  const combinationsLeft = combinations.length - index

  // eslint-disable-next-line fp/no-let
  let combinationA = combination
  // eslint-disable-next-line fp/no-let
  let resA = res

  // eslint-disable-next-line fp/no-loops
  while (
    isRemainingCombination({
      combination: combinationA,
      duration,
      exec,
      stopState,
    })
  ) {
    const sampleStart = getSampleStart()
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    stopState.sampleStart = sampleStart

    updatePreviewEnd({
      combination: combinationA,
      combinations,
      combinationsLeft,
      previewState,
      duration,
    })

    // eslint-disable-next-line no-await-in-loop
    const { combination: newCombination, res: resB } = await measureSample(
      combinationA,
      server,
      resA,
    )

    // eslint-disable-next-line no-await-in-loop
    const newCombinationA = await aggregatePreview({
      newCombination,
      combinations,
      previewConfig,
      previewState,
    })

    const newCombinationB = addSampleDuration(newCombinationA, sampleStart)
    // eslint-disable-next-line fp/no-mutation
    combinationA = newCombinationB
    // eslint-disable-next-line fp/no-mutation
    resA = resB
  }

  const combinationB = aggregateMeasures(combinationA)

  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.combination

  return { combination: combinationB, res: resA }
}
