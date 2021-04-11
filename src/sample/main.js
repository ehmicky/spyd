import now from 'precise-now'

import { sendAndReceive } from '../process/ipc.js'

import { getParams } from './params.js'
import { getMeasureState } from './return.js'

// Measure a new sample for a given combination
export const measureSample = async function ({
  measureState,
  server,
  res,
  minLoopDuration,
  measureDuration,
}) {
  const params = getParams(measureState, measureDuration)

  const {
    returnValue,
    res: resA,
    measureDuration: measureDurationA,
  } = await measureNewSample(params, server, res)
  const measureStateA = getMeasureState(
    measureState,
    returnValue,
    minLoopDuration,
  )
  return {
    res: resA,
    measureDuration: measureDurationA,
    measureState: measureStateA,
  }
}

// `measureDuration` is how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform each step and doing IPC so that the
// actual sample duration does not deviate too much if one of those happened to
// be slow.
// We only keep the last `measureDuration` instead of taking the median of all
// previous ones, so that `measureDuration` quickly adapts to machine slowdowns.
const measureNewSample = async function (params, server, res) {
  const measureDurationStart = now()
  const { returnValue, res: resA } = await sendAndReceive(params, server, res)
  const measureDuration = now() - measureDurationStart
  return { returnValue, res: resA, measureDuration }
}
