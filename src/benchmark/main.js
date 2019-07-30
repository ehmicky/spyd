import { getBiases } from './bias.js'
import { benchmarkLoop } from './loop.js'
import { measure } from './measure.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const benchmark = async function(main, before, after, duration) {
  initialMeasure()

  const { nowBias, loopBias, minTime, mainDuration } = await getBiases(duration)

  const result = await benchmarkLoop(
    main,
    before,
    after,
    mainDuration,
    nowBias,
    loopBias,
    minTime,
  )
  return result
}

// For some reasons I ignore (likely engine optimizations), when `measure()`
// is benchmarking its first function, it's running much faster than for the
// next functions passed to it.
// We fix this by doing a cold start using an empty function
const initialMeasure = function() {
  measure(noop, undefined, undefined, 0, 0, 1)
}

// This needs to be a different function from the `noop` used during bias
// calculation
// eslint-disable-next-line no-empty-function
const noop = function() {}
