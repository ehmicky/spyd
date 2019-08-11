import { getPrintedSystem } from '../print/system.js'

import { addPrevious } from './previous.js'
import { dereferenceBenchmark } from './dereference.js'

// Add report-specific information that is not saved in data files
export const normalizeBenchmark = async function(
  { show, diff, dataDir, store, nested },
  benchmark,
) {
  const benchmarkA = dereferenceBenchmark(benchmark)

  const nestedNormalize = getNestedNormalize({
    show,
    diff,
    dataDir,
    store,
    nested,
  })
  const benchmarkB = await addPrevious({
    benchmark: benchmarkA,
    diff,
    dataDir,
    store,
    nestedNormalize,
  })

  const timestamp = getTimestamp(benchmarkB, show)

  const printedSystem = getPrintedSystem(benchmarkB)

  return { ...benchmarkB, timestamp, printedSystem }
}

// Apply `normalizeBenchmark()` recursively on the `previous` benchmarks
const getNestedNormalize = function({ show, diff, dataDir, store, nested }) {
  if (nested) {
    return
  }

  return normalizeBenchmark.bind(null, {
    show,
    diff,
    dataDir,
    store,
    nested: true,
  })
}

// Only show timestamp when the `show` option is used
const getTimestamp = function({ timestamp }, show) {
  if (show === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}
