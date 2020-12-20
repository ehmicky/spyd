// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'

import { getRemainingCombinations, getNextCombination } from './duration.js'
import { findCombinationByUrl } from './url.js'

// We ensure combinations are never measured at the same time:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to execute in parallel but in practice they
//    do impact the performance of each other
//  - this does mean we are under-utilizing CPUs
// We also break down each combination into samples, i.e. small units of
// duration when measures are taken:
//  - This allows combinations to be live reported at the same time, displaying
//    them competing with each other
//  - This allows some parameters to be callibrated (e.g. `repeat`)
//  - This helps during manual interruptions (CTRL-C) by allowing samples to
//    end so tasks can be cleaned up
//  - This provides with fast fail if one of the combinations fails
// To do this requires orchestrating combinations and samples. Using purely
// functional code is difficult here, so we use events instead. Each combination
// communicate to some shared orchestrating logic using its own `orchestrator`
// `EventEmitter`.
//  - When a combination ends, it notifies it using the `end` event
//  - The shared logic computes which combination should go next by sending it a
//    `sample` event with `true`
//  - Each combination waits for its turn by awaiting this `sample` event
//  - When there is no `duration` left, the `sample` event with `false` is used
//    so combination stops waiting for their turn
// Additionally, when a combination is waiting on a runner to return its return
// value by sending an HTTP request, it waits on the `request` event, which is
// emitted by the HTTP server.
export const getOrchestrator = function () {
  return new EventEmitter()
}

export const initOrchestrators = function ({
  server,
  combinations,
  benchmarkEnd,
}) {
  // We need to use `new Promise()` for error handling due to using events.
  // eslint-disable-next-line promise/avoid-new
  return new Promise((resolve, reject) => {
    handleRequests(server, combinations, reject)
    addEndHandlers(combinations, benchmarkEnd)
  })
}

// Handle HTTP requests coming from runners.
// Emit a `return` event to communicate it to the proper combination.
const handleRequests = function (server, combinations, reject) {
  server.on('request', (req, res) => {
    try {
      handleRequest(combinations, req, res)
    } catch (error) {
      reject(error)
    }
  })
}

const handleRequest = function (combinations, req, res) {
  const { orchestrator } = findCombinationByUrl(req, combinations)
  orchestrator.emit('return', { req, res })
}

// Handles each combination sample
const addEndHandlers = function (combinations, benchmarkEnd) {
  const state = { pending: combinations.length - 1 }
  combinations.forEach(({ orchestrator }) => {
    addEndHandler({ orchestrator, combinations, state, benchmarkEnd })
  })
}

const addEndHandler = function ({
  orchestrator,
  combinations,
  state,
  benchmarkEnd,
}) {
  orchestrator.on('end', () => {
    onSampleEnd({ combinations, state, benchmarkEnd })
  })
}

// Each time a sample ends, we compute the next one to execute and send a
// `sample` event to it.
// During the initial load, each process is executed in parallel. We wait for
// all of them to have finished loading first, using `state.pending`.
const onSampleEnd = function ({ combinations, state, benchmarkEnd }) {
  if (state.pending !== 0) {
    // eslint-disable-next-line fp/no-mutation, no-param-reassign
    state.pending -= 1
    return
  }

  const remainingCombinations = getRemainingCombinations(
    combinations,
    benchmarkEnd,
  )

  if (shouldExitBenchmark(remainingCombinations)) {
    exitCombinations(combinations)
    return
  }

  const { orchestrator } = getNextCombination(remainingCombinations)
  orchestrator.emit('sample', true)
}

// When there is no `duration` left, we send a `sample` event with `false` to
// all combinations.
const shouldExitBenchmark = function (remainingCombinations) {
  return remainingCombinations.length === 0
}

const exitCombinations = function (combinations) {
  combinations.forEach(exitCombination)
}

const exitCombination = function ({ orchestrator }) {
  orchestrator.emit('sample', false)
}
