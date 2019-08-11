import { addPrevious } from './previous.js'
import { dereferenceBenchmark } from './dereference.js'

// Add report-specific information that is not saved in data files
export const normalizeBenchmark = async function({
  benchmark,
  show,
  dataDir,
  store,
}) {
  const benchmarkA = dereferenceBenchmark(benchmark)
  const benchmarkB = await addPrevious({
    benchmark: benchmarkA,
    dataDir,
    store,
  })
  const benchmarkC = hideTimestamp(benchmarkB, show)
  return benchmarkC
}

// Only show timestamp when the `show` option is used
const hideTimestamp = function({ timestamp, ...benchmark }, show) {
  if (show === undefined) {
    return benchmark
  }

  const timestampA = new Date(timestamp).toLocaleString()
  return { ...benchmark, timestamp: timestampA }
}
