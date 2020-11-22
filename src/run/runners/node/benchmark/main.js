import { benchmarkLoop } from './loop.js'

// Measure how long a task takes.
// Run the benchmark for a specific amount of time.
export const benchmark = function ({
  main,
  before,
  after,
  async,
  repeat,
  maxDuration,
  maxTimes,
}) {
  return benchmarkLoop({
    main,
    before,
    after,
    async,
    repeat,
    maxDuration,
    maxTimes,
  })
}
