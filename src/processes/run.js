import pReduce from 'p-reduce'

import { now } from '../now.js'

import { getChildMessage, sendChildMessage } from './ipc.js'
import { endChild } from './end.js'

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
export const runChildren = function(children, processDuration, runEnd) {
  return pReduce(
    children,
    (results, child) => runChild(child, processDuration, runEnd, results),
    [],
  )
}

const runChild = async function(child, processDuration, runEnd, results) {
  const resultsA = await executeChild(child, processDuration, runEnd, results)

  await endChild(child)

  return resultsA
}

const executeChild = async function(child, processDuration, runEnd, results) {
  if (now() > runEnd && results.length !== 0) {
    return results
  }

  await sendChildMessage(child, 'run', processDuration)
  const result = await getChildMessage(child, 'result')
  return [...results, result]
}
