import { now } from '../now.js'

// Stop running child processes if either:
//  - we reached the max `duration`
//  - the `results` size is over `MAX_RESULTS`. We do so in order to avoid
//    crashing the process due to memory limits.
// At least one child must be executed.
export const shouldStop = function(runEnd, results) {
  return now() > runEnd || isOverMaxLoops(results)
}

const isOverMaxLoops = function(results) {
  const resultsSize = results.reduce(addLoops, 0)
  return resultsSize >= MAX_RESULTS
}

const addLoops = function(total, { times }) {
  return total + times.length
}

const MAX_RESULTS = 1e8
