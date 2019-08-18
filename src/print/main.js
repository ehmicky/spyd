import { addFastestIterations } from './fastest.js'
import { dereferenceBenchmark } from './dereference.js'
import { addPrevious } from './previous.js'
import { normalizeStats, prettifyStats } from './stats/main.js'
import { prettifySystem } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(
  { iterations, ...benchmark },
  { diff, verbose, benchmarks },
) {
  const iterationsA = addFastestIterations(iterations)

  const iterationsB = dereferenceBenchmark(iterationsA, benchmark)

  const { previous, iterations: iterationsC } = addPrevious({
    benchmarks,
    benchmark,
    iterations: iterationsB,
    diff,
    verbose,
    addPrintedInfo,
  })

  const iterationsD = normalizeStats(iterationsC)
  const iterationsE = prettifyStats(iterationsD, verbose)

  const timestamp = prettifyTimestamp(benchmark)

  const systemPretty = prettifySystem(benchmark)

  return {
    ...benchmark,
    timestamp,
    systemPretty,
    iterations: iterationsE,
    previous,
  }
}

// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
const prettifyTimestamp = function({ timestamp }) {
  return new Date(timestamp).toLocaleString()
}
