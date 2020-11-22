import { getUnsortedMedian } from '../stats/median.js'

import { preciseTimestamp } from './precise_timestamp.js'

// Estimates how much time is spent loading runners as opposed to running the
// task.
// That estimation is used when computing the optimal process `maxDuration`.
// This includes the time spent:
//  - spawning the child process
//  - loading the runner, e.g. loading files and dependencies
//  - loading the task
// This does not include the time spent:
//  - iterating on the repeat loop itself
//  - sending the results (runner)
//  - receiving the results (parent process)
//  - normalizing and aggregating the results
// The above are not included because their duration depends on the number of
// repeat loops performed
//  - that number depends on `maxDuration`, which is based on `benchmarkCost`
//  - this would create a cycle making the `benchmarkCost` increase forever
// The estimation is based on the difference between two timestamps:
//  - in the parent process, right before spawning a new runner process
//  - in the runner process, right before measuring, but after loading
//    dependencies and the task. This is sent back to parent in the results.
// Those timestamps are in nanoseconds
//  - some runners or systems might not allow such a high resolution, but they
//    should stil use that unit
//  - runners with lower resolution make the `benchmarkCost` vary more
// Runners should strive to load dependencies and tasks as fast as possible,
// since it:
//  - increases the time spent on measuring
//  - maximizes the number of processes per combination
// The estimation is made for each new process. A median of the `previous`
// processes' `benchmarkCost` is used
//  - the initial default value is based on the time it took to load the
//    combinations
//  - it is not included it in the `previous` array though since it might differ
//    significantly for some runners
//  - since sorting big arrays is very slow, we only sort a sample of them
// Each combination estimates its own `benchmarkCost`:
//  - in most cases, that value should be similar for combinations using the
//    same runner
//  - however, it is possible that a runner might be doing some extra logic at
//    `run` time (instead of load time) when retrieving a task with a specific
//    option, such as dynamically loading some code for that specific task
export const startBenchmarkCost = function () {
  return preciseTimestamp()
}

// In case the runner resolution is low, `benchmarkCostEnd` might have a lower
// resolution than `benchmarkCostStart` and the difference might be negative
export const endBenchmarkCost = function (
  benchmarkCostStart,
  benchmarkCostEnd,
) {
  return Math.max(Number(BigInt(benchmarkCostEnd) - benchmarkCostStart), 0)
}

export const getBenchmarkCost = function (childBenchmarkCost, benchmarkCosts) {
  // eslint-disable-next-line fp/no-mutating-methods
  benchmarkCosts.push(childBenchmarkCost)
  const benchmarkCost = getUnsortedMedian(
    benchmarkCosts,
    BENCHMARK_COST_SORT_MAX,
  )
  return benchmarkCost
}

// Size of the sorting sample.
// A lower value will make `benchmarkCost` vary more.
// A higher value will increase the time to sort by `O(n * log(n))`
const BENCHMARK_COST_SORT_MAX = 1e2
