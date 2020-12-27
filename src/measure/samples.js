import {
  combinationHasErrored,
  failOnProcessExit,
} from '../error/combination.js'
import { sendAndReceive } from '../process/send.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import {
  getMeasureDurationStart,
  getMeasureDurationLast,
} from './measure_duration.js'
import { getNextCombination } from './next.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Run samples to measure each combination.
// We ensure combinations are never measured at the same time
//  - Otherwise, they would compete for memory and CPU, making results less
//    precise.
//  - Start, stop and exit can be run in parallel though since they do not
//    measure
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be callibrated (e.g. `repeat`)
//  - This helps during manual interruptions (CTRL-C) by allowing samples to
//    end so tasks can be cleaned up
//  - This provides with fast fail if one of the combinations fails
export const measureSamples = async function (combinations, progressState) {
  const combinationMaxLoops = getCombinationMaxLoops(combinations)

  // eslint-disable-next-line fp/no-loops
  while (true) {
    const combination = getNextCombination(
      combinations,
      progressState,
      combinationMaxLoops,
    )

    // eslint-disable-next-line max-depth
    if (combination === undefined) {
      break
    }

    // eslint-disable-next-line no-await-in-loop
    const newCombination = await eMeasureSample(combination)
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    combinations = updateCombinations(combinations, newCombination, combination)
  }

  return combinations
}

const getCombinationMaxLoops = function (combinations) {
  return Math.ceil(MAX_LOOPS / combinations.length)
}

// We stop running samples when the `measures` is over `MAX_LOOPS`. This
// is meant to prevent memory overflow.
// The default limit for V8 in Node.js is 1.7GB, which allows measures to hold a
// little more than 1e8 floats.
const MAX_LOOPS = 1e8

const eMeasureSample = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    measureSample(combination),
  ])
}

const measureSample = async function (combination) {
  const sampleStart = getSampleStart()
  const params = getParams(combination)

  const {
    newCombination,
    returnValue,
    measureDurationLast,
  } = await measureNewSample(combination, params)

  if (combinationHasErrored(newCombination)) {
    return newCombination
  }

  const newProps = handleReturnValue(
    { ...newCombination, measureDurationLast },
    returnValue,
    params,
  )
  const newCombinationA = { ...newCombination, ...newProps }
  const newCombinationB = addSampleDuration(newCombinationA, sampleStart)
  return newCombinationB
}

const measureNewSample = async function (combination, params) {
  const measureDurationStart = getMeasureDurationStart()
  const { newCombination, returnValue } = await sendAndReceive(
    combination,
    params,
  )
  const measureDurationLast = getMeasureDurationLast(measureDurationStart)
  return { newCombination, returnValue, measureDurationLast }
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
