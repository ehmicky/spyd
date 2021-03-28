import {
  failOnProcessExit,
  combinationHasErrored,
} from '../error/combination.js'
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
//  - Start, end and exit can be run in parallel though since they do not
//    measure
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
// eslint-disable-next-line max-statements, complexity
export const performMeasureLoop = async function ({
  combinations,
  duration,
  previewConfig,
  previewState,
  stopState,
  exec,
}) {
  if (isInit(combinations)) {
    return combinations
  }

  setBenchmarkStart(previewState)

  // eslint-disable-next-line fp/no-loops, fp/no-let, fp/no-mutation
  for (let index = 0; index < combinations.length; index += 1) {
    // eslint-disable-next-line fp/no-let
    let combination = combinations[index]
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    stopState.combination = combination
    const combinationsLeft = combinations.length - index

    // eslint-disable-next-line fp/no-loops, max-depth
    do {
      const sampleStart = getSampleStart()
      // eslint-disable-next-line fp/no-mutation, no-param-reassign
      stopState.sampleStart = sampleStart

      updatePreviewEnd({
        combination,
        combinations,
        combinationsLeft,
        previewState,
        duration,
      })

      // eslint-disable-next-line no-await-in-loop
      const newCombination = await eMeasureSample(combination, stopState)

      // eslint-disable-next-line no-await-in-loop
      const newCombinationA = await aggregatePreview({
        newCombination,
        combinations,
        index,
        previewConfig,
        previewState,
      })

      const newCombinationB = addSampleDuration(newCombinationA, sampleStart)
      // eslint-disable-next-line fp/no-mutation
      combination = newCombinationB

      // eslint-disable-next-line max-depth
      if (isStoppedCombination(newCombinationB, stopState)) {
        break
      }
    } while (isRemainingCombination(combination, duration, exec))

    const combinationA = aggregateMeasures(combination)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign, require-atomic-updates
    combinations[index] = combinationA

    // eslint-disable-next-line max-depth
    if (isStoppedCombination(combinationA, stopState)) {
      break
    }
  }

  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.combination

  return combinations
}

// Task init, retrieving only task and step identifiers
const isInit = function (combinations) {
  return !combinations.some(hasTaskId)
}

const hasTaskId = function ({ taskId }) {
  return taskId !== undefined
}

// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends and exits, for cleanup.
const isStoppedCombination = function (combination, { stopped }) {
  return stopped || combinationHasErrored(combination)
}

const eMeasureSample = async function (combination, stopState) {
  return await Promise.race([
    failOnProcessExit(combination, stopState),
    measureSample(combination),
  ])
}
