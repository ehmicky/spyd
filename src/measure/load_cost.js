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
//  - sending the measures (runner)
//  - receiving the measures (parent process)
//  - normalizing and aggregating the processMeasures
// The above are not included because their duration depends on the number of
// repeat loops performed
//  - that number depends on `maxDuration`, which is based on `loadCost`
//  - this would create a cycle making the `loadCost` increase forever
// The estimation is based on the difference between two timestamps:
//  - in the parent process, right before spawning a new runner process
//  - in the runner process, right before measuring, but after loading
//    dependencies and the task. This is sent back to parent in the ipcReturn.
// Those timestamps are in nanoseconds
//  - some runners or systems might not allow such a high resolution, but they
//    should stil use that unit
//  - runners with lower resolution make the `loadCost` vary more
// Runners should strive to load dependencies and tasks as fast as possible,
// since it:
//  - increases the time spent on measuring
//  - maximizes the number of processes per combination
// The estimation is made for each new process. A median of the `previous`
// processes' `loadCost` is used
//  - the initial default value is based on the time it took to load the
//    combinations
//  - it is not included it in the `previous` array though since it might differ
//    significantly for some runners
//  - since sorting big arrays is very slow, we only sort a sample of them
// Each combination estimates its own `loadCost`:
//  - in most cases, that value should be similar for combinations using the
//    same runner
//  - however, it is possible that a runner might be doing some extra logic at
//    `run` time (instead of load time) when retrieving a task with a specific
//    configuration property, such as dynamically loading some code for that
//    specific task
export const startLoadCost = function () {
  return preciseTimestamp()
}

// In case the runner resolution is low, `loadCostEnd` might have a lower
// resolution than `loadCostStart` and the difference might be negative
export const endLoadCost = function (loadCostStart, loadCostEnd) {
  return Math.max(Number(BigInt(loadCostEnd) - loadCostStart), 0)
}

export const getLoadCost = function (childLoadCost, loadCosts) {
  // eslint-disable-next-line fp/no-mutating-methods
  loadCosts.push(childLoadCost)
  const loadCost = getUnsortedMedian(loadCosts, LOAD_COST_SORT_MAX)
  return loadCost
}

// Size of the sorting sample.
// A lower value will make `loadCost` vary more.
// A higher value will increase the time to sort by `O(n * log(n))`
const LOAD_COST_SORT_MAX = 1e2
