import { getUnsortedMedian } from '../stats/median.js'

// Computes how much time is spent spawning processes/runners as opposed to
// running the benchmarked task.
// Note that this does not include the time spent by the runner iterating on
// the benchmark loop itself, since that time increases proportionally to the
// number of loops. It only includes the time initially spent when each process
// loads.
// We measure this continuously for each new process. Runners returns the
// `duration` of the benchmarking logic so it can be excluded from this.
// We use a median of the previous processes' `benchmarkCost`. We do not include
// it in the `previous` array though since it might differ significantly for
// some runners.
// Since sorting big arrays is very slow, we only sort a sample of them.
// The initial value is based on the time it took to load the iterations.
// Each iteration estimates its own `benchmarkCost`. In most cases, that value
// should be similar for iterations using the same runner. However, it is
// possible that a runner might be doing some extra logic at `run` time
// (instead of load time) when retrieving a task with a specific option, such
// as dynamically loading some code for that specific task.
export const updateBenchmarkCost = function (
  childBenchmarkCost,
  benchmarkCost,
) {
  // eslint-disable-next-line fp/no-mutating-methods
  benchmarkCost.previous.push(childBenchmarkCost)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  benchmarkCost.estimate = getUnsortedMedian(
    benchmarkCost.previous,
    BENCHMARK_COST_SORT_MAX,
  )
}

// Size of the sorting sample.
// A lower value will make `benchmarkCost` vary more.
// A higher value will increase the time to sort by `O(n * log(n))`
const BENCHMARK_COST_SORT_MAX = 1e2
