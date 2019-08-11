import { getPrintedSystem } from '../print/system.js'

import { addPrevious } from './previous.js'
import { dereferenceBenchmark } from './dereference.js'

// Add report-specific information that is not saved in data files
export const normalizeBenchmark = async function(
  { show, diff, dataDir, store, nested },
  { iterations, ...benchmark },
) {
  const iterationsA = dereferenceBenchmark({ benchmark, iterations })

  const nestedNormalize = getNestedNormalize({
    show,
    diff,
    dataDir,
    store,
    nested,
  })
  const { previous, iterations: iterationsB } = await addPrevious({
    benchmark,
    iterations: iterationsA,
    diff,
    dataDir,
    store,
    nestedNormalize,
  })

  const timestamp = getTimestamp(benchmark, show)

  const printedSystem = getPrintedSystem(benchmark)

  return {
    ...benchmark,
    timestamp,
    printedSystem,
    iterations: iterationsB,
    previous,
  }
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
