import { failOnProcessExit } from '../error/combination.js'
import { setBenchmarkStart } from '../preview/set.js'
import { measureSample } from '../sample/main.js'

import { aggregatePreview, aggregateMeasuresEnd } from './aggregate.js'
import { getSampleStart, addSampleDuration } from './duration.js'
import { getNextCombination } from './next.js'
import { updateCombinations } from './update.js'

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
//  - This allows some parameters to be callibrated (e.g. `repeat`)
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
// eslint-disable-next-line max-statements
export const performMeasureLoop = async function ({
  combinations,
  duration,
  previewConfig,
  exec,
  previewState,
  stopState,
}) {
  if (isInit(combinations)) {
    return combinations
  }

  setBenchmarkStart(previewState, duration)

  // eslint-disable-next-line fp/no-loops
  while (true) {
    const sampleStart = getSampleStart()
    const combination = getNextCombination({
      combinations,
      duration,
      exec,
      previewState,
      stopState,
    })

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(stopState, { sampleStart, combination })

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await eMeasureSample(combination, stopState)

    // eslint-disable-next-line no-await-in-loop
    const newCombinationA = await aggregatePreview({
      newCombination,
      combinations,
      previewState,
      previewConfig,
    })

    const newCombinationB = addSampleDuration(newCombinationA, sampleStart)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(combinations, newCombinationB)
  }

  const combinationsB = combinations.map(aggregateMeasuresEnd)

  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.combination

  return combinationsB
}

// Task init, retrieving only task and step identifiers
const isInit = function (combinations) {
  return !combinations.some(hasTaskId)
}

const hasTaskId = function ({ taskId }) {
  return taskId !== undefined
}

const eMeasureSample = async function (combination, stopState) {
  return await Promise.race([
    failOnProcessExit(combination, stopState),
    measureSample(combination),
  ])
}
