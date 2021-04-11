import now from 'precise-now'

import { sendAndReceive } from '../process/ipc.js'

import { getParams } from './params.js'
import { getSampleState } from './state.js'

// Measure a new sample for a given combination
export const measureSample = async function ({
  sampleState,
  server,
  res,
  minLoopDuration,
}) {
  const params = getParams(sampleState)

  const {
    returnValue,
    res: resA,
    sampleState: sampleStateA,
  } = await measureNewSample({ params, server, res, sampleState })
  const sampleStateB = getSampleState({
    sampleState: sampleStateA,
    returnValue,
    minLoopDuration,
  })
  return { res: resA, sampleState: sampleStateB }
}

// `measureDuration` is how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform each step and doing IPC so that the
// actual sample duration does not deviate too much if one of those happened to
// be slow.
// We only keep the last `measureDuration` instead of taking the median of all
// previous ones, so that `measureDuration` quickly adapts to machine slowdowns.
const measureNewSample = async function ({ params, server, res, sampleState }) {
  const measureDurationStart = now()
  const { returnValue, res: resA } = await sendAndReceive(params, server, res)
  const measureDuration = now() - measureDurationStart
  const sampleStateA = { ...sampleState, measureDuration }
  return { returnValue, res: resA, sampleState: sampleStateA }
}
