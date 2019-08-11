// Add report-specific information that is not saved in data files
export const normalizeBenchmark = function({ benchmark, show }) {
  const benchmarkA = hideTimestamp(benchmark, show)
  return benchmarkA
}

// Only show timestamp when the `show` option is used
const hideTimestamp = function({ timestamp, ...benchmark }, show) {
  if (show === undefined) {
    return benchmark
  }

  const timestampA = new Date(timestamp).toLocaleString()
  return { ...benchmark, timestamp: timestampA }
}
