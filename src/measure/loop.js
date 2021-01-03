import { failOnProcessExit } from '../error/combination.js'
import { setBenchmarkStart } from '../progress/set.js'
import { measureSample } from '../sample/main.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import { getNextCombination } from './next.js'

// Run samples to measure each combination.
// We ensure combinations are never measured at the same time
//  - Otherwise, they would compete for memory and CPU, making results less
//    precise.
//  - Start, end and exit can be run in parallel though since they do not
//    measure
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
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
//  - This can be either hardcoded or using the `input` configuration property.
// eslint-disable-next-line max-statements
export const performMeasureLoop = async function ({
  combinations,
  duration,
  progressState,
  stopState,
}) {
  setBenchmarkStart(progressState, duration)

  // eslint-disable-next-line fp/no-loops
  while (true) {
    const sampleStart = getSampleStart()
    const combination = getNextCombination({
      combinations,
      duration,
      progressState,
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
    const newCombinationA = addSampleDuration(newCombination, sampleStart)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(
      combinations,
      newCombinationA,
      combination,
    )
  }

  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.sampleStart
  // eslint-disable-next-line fp/no-delete, no-param-reassign
  delete stopState.combination

  return combinations
}

const eMeasureSample = async function (combination, stopState) {
  return await Promise.race([
    failOnProcessExit(combination, stopState),
    measureSample(combination),
  ])
}

const updateCombinations = function (
  combinations,
  newCombination,
  oldCombination,
) {
  return combinations.map((combination) =>
    updateCombination(combination, newCombination, oldCombination),
  )
}

const updateCombination = function (
  combination,
  newCombination,
  oldCombination,
) {
  return combination === oldCombination ? newCombination : combination
}
