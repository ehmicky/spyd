// Add `benchmark.group`.
// Also the `group` option can be "" to re-use the previous benchmark's group.
export const addGroup = function (benchmark, benchmarks, { group }) {
  const groupA = handleSame(benchmarks, group)
  return { ...benchmark, group: groupA }
}

const handleSame = function (benchmarks, group) {
  if (group !== '') {
    return group
  }

  const lastBenchmark = benchmarks[benchmarks.length - 1]

  if (lastBenchmark === undefined) {
    throw new Error(
      "Cannot use group='' because there are no previous benchmarks",
    )
  }

  return lastBenchmark.group
}
