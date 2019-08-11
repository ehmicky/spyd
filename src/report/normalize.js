import { addPrevious } from './previous.js'

// Add report-specific information that is not saved in data files
export const normalizeBenchmark = async function({
  benchmark,
  show,
  dataDir,
  store,
}) {
  const benchmarkA = await addPrevious({ benchmark, dataDir, store })
  const benchmarkB = hideTimestamp(benchmarkA, show)
  return benchmarkB
}

// Only show timestamp when the `show` option is used
const hideTimestamp = function({ timestamp, ...benchmark }, show) {
  if (show === undefined) {
    return benchmark
  }

  const timestampA = new Date(timestamp).toLocaleString()
  return { ...benchmark, timestamp: timestampA }
}
