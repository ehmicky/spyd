import pMapSeries from 'p-map-series'

import { now } from '../now.js'

import { getChildMessage, sendChildMessage } from './ipc.js'
import { endChild } from './end.js'

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
export const runChildren = async function(
  children,
  processDuration,
  runEnd,
  state,
) {
  const results = await pMapSeries(children, child =>
    runChild(child, processDuration, runEnd, state),
  )
  const resultsA = results.filter(isDefined)
  return resultsA
}

const runChild = async function(child, processDuration, runEnd, state) {
  const result = await executeChild(child, processDuration, runEnd, state)

  await endChild(child)

  return result
}

const executeChild = async function(child, processDuration, runEnd, state) {
  if (now() > runEnd && state.processes !== 0) {
    return
  }

  // eslint-disable-next-line no-param-reassign, fp/no-mutation
  state.processes += 1

  await sendChildMessage(child, 'run', processDuration)
  const result = await getChildMessage(child, 'result')

  return result
}

const isDefined = function(value) {
  return value !== undefined
}
