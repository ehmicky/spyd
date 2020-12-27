import { combinationHasErrored } from '../error/combination.js'
import { sendAndReceive } from '../process/send.js'

import { getSampleStart, addSampleDuration } from './duration.js'
import {
  getMeasureDurationStart,
  getMeasureDurationLast,
} from './measure_duration.js'
import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure a new sample for a given combination
export const measureSample = async function (combination) {
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
