import { now } from '../now.js'

export const shouldStop = function(runEnd, results) {
  return now() > runEnd || isOverMaxLoops(results)
}

// We limit the size of the `results` in order to avoid crashing the process
// due to memory limits
const isOverMaxLoops = function(results) {
  const resultsSize = results.reduce(addLoops, 0)
  return resultsSize >= MAX_RESULTS
}

const addLoops = function(total, { times }) {
  return total + times.length
}

const MAX_RESULTS = 1e8
