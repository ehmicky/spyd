import { benchmark, getBiases } from './temp.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const execute = function(duration) {
  const { nowBias, loopBias, minTime } = getBiases(duration)
  const time = benchmark(func, duration, nowBias, loopBias, minTime)
  return time
}

const func = Math.random
