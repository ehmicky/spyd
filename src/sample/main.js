import now from 'precise-now'

import { combinationHasErrored } from '../error/combination.js'
import { sendAndReceive } from '../process/send.js'

import { getParams } from './params.js'
import { handleReturnValue } from './return.js'

// Measure a new sample for a given combination
export const measureSample = async function (combination) {
  const params = getParams(combination)

  const {
    newCombination,
    returnValue,
    measureDuration,
  } = await measureNewSample(combination, params)

  if (combinationHasErrored(newCombination)) {
    return newCombination
  }

  const newProps = handleReturnValue(newCombination, returnValue)
  return { ...newCombination, ...newProps, measureDuration }
}

// `measureDuration` is how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform each step and doing IPC so that the
// actual sample duration does not deviate too much if one of those happened to
// be slow.
// We only keep the last `measureDuration` instead of taking the median of all
// previous ones, so that `measureDuration` quickly adapts to machine slowdowns.
const measureNewSample = async function (combination, params) {
  const measureDurationStart = now()
  const { newCombination, returnValue } = await sendAndReceive(
    combination,
    params,
  )
  const measureDuration = now() - measureDurationStart
  return { newCombination, returnValue, measureDuration }
}
