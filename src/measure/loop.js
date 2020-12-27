import { failOnProcessExit } from '../error/combination.js'
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
export const performMeasureLoop = async function ({
  combinations,
  progressState,
  stopState,
}) {
  // eslint-disable-next-line fp/no-loops
  while (true) {
    const sampleStart = getSampleStart()
    const combination = getNextCombination({
      combinations,
      progressState,
      stopState,
    })
    // eslint-disable-next-line fp/no-mutating-assign
    Object.assign(stopState, { sampleStart, combination })

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await eMeasureSample(combination)
    const newCombinationA = addSampleDuration(newCombination, sampleStart)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(
      combinations,
      newCombinationA,
      combination,
    )
  }

  return combinations
}

const eMeasureSample = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
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
