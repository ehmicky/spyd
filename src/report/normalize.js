import { addPrevious } from './previous.js'
import { dereferenceBenchmark } from './dereference.js'

// Add report-specific information that is not saved in data files
export const normalizeBenchmark = async function(
  { show, dataDir, store, nested },
  benchmark,
) {
  const benchmarkA = dereferenceBenchmark(benchmark)

  const nestedNormalize = getNestedNormalize({ show, dataDir, store, nested })
  const benchmarkB = await addPrevious({
    benchmark: benchmarkA,
    dataDir,
    store,
    nestedNormalize,
  })

  const benchmarkC = hideTimestamp(benchmarkB, show)
  return benchmarkC
}

// Apply `normalizeBenchmark()` recursively on the `previous` benchmarks
const getNestedNormalize = function({ show, dataDir, store, nested }) {
  if (nested) {
    return
  }

  return normalizeBenchmark.bind(null, { show, dataDir, store, nested: true })
}

// Only show timestamp when the `show` option is used
const hideTimestamp = function({ timestamp, ...benchmark }, show) {
  if (show === undefined) {
    return benchmark
  }

  const timestampA = new Date(timestamp).toLocaleString()
  return { ...benchmark, timestamp: timestampA }
}
