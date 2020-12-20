// eslint-disable-next-line fp/no-events
import { EventEmitter } from 'events'

import { getRemainingCombinations, getNextCombination } from './duration.js'

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

// Handles each combination sample
export const addEndHandlers = function (combinations, benchmarkEnd) {
  combinations.forEach(({ orchestrator }) => {
    addEndHandler({ orchestrator, combinations, benchmarkEnd })
  })
}

const addEndHandler = function ({ orchestrator, combinations, benchmarkEnd }) {
  orchestrator.on('end', () => {
    onSampleEnd(combinations, benchmarkEnd)
  })
}

// Each time a sample ends, we compute the next one to execute and send a
// `sample` event to it.
// During the initial load, each process is executed in parallel. We wait for
// all of them to have finished loading first, using `state.pending`.
const onSampleEnd = function (combinations, benchmarkEnd) {
  if (!isLoadedCombinations(combinations)) {
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

const isLoadedCombinations = function (combinations) {
  return combinations.every(isLoadedCombination)
}

const isLoadedCombination = function ({ state: { loaded } }) {
  return loaded
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
