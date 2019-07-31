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
  results,
) {
  await pMapSeries(children, child =>
    runChild(child, processDuration, runEnd, results),
  )
}

const runChild = async function(child, processDuration, runEnd, results) {
  await executeChild(child, processDuration, runEnd, results)

  await endChild(child)
}

const executeChild = async function(child, processDuration, runEnd, results) {
  if (now() > runEnd && results.length !== 0) {
    return
  }

  await sendChildMessage(child, 'run', processDuration)
  const result = await getChildMessage(child, 'result')
  // eslint-disable-next-line fp/no-mutating-methods
  results.push(result)
}
