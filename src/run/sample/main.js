import now from 'precise-now'

import { sendAndReceive } from '../process/ipc.js'

import { getSampleState } from './state.js'

// Measure a new sample for a given combination
export const measureSample = async (
  { server, minLoopDuration, targetSampleDuration },
  sampleState,
) => {
  const payload = getPayload(sampleState, minLoopDuration)
  const { returnValue, measureDuration } = await measureNewSample(
    payload,
    server,
  )
  const sampleStateA = getSampleState(sampleState, returnValue, {
    minLoopDuration,
    measureDuration,
    targetSampleDuration,
  })
  return sampleStateA
}

// Compute event payload to send to the measuring sample
// When estimating `measureCost`, we pass `repeat: 0` to the runner
const getPayload = ({ repeat, maxLoops }, minLoopDuration) => {
  const repeatPayload = minLoopDuration === 0 ? 0 : repeat
  return { event: 'measure', repeat: repeatPayload, maxLoops }
}

// `measureDuration` is how long it takes to get a single sample's results.
// This is used to compute `maxLoops` to make the average sample last a specific
// duration.
// This includes the duration to perform each step and doing IPC so that the
// actual sample duration does not deviate too much if one of those happened to
// be slow.
// We only keep the last `measureDuration` instead of taking the mean of all
// previous ones, so that `measureDuration` quickly adapts to machine slowdowns.
const measureNewSample = async (payload, server) => {
  const measureDurationStart = now()
  const returnValue = await sendAndReceive(payload, server)
  const measureDuration = now() - measureDurationStart
  return { returnValue, measureDuration }
}
