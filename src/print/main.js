import { addFastestIterations } from './fastest.js'
import { dereferenceBenchmark } from './dereference.js'
import { addPrevious } from './previous.js'
import { normalizeStats, addPrintedStats } from './stats/main.js'
import { getPrintedSystem } from './system.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function(
  { iterations, ...benchmark },
  { show, diff, verbose, benchmarks },
) {
  const iterationsA = addFastestIterations(iterations)

  const iterationsB = dereferenceBenchmark(iterationsA, benchmark)

  const { previous, iterations: iterationsC } = addPrevious({
    benchmarks,
    benchmark,
    iterations: iterationsB,
    show,
    diff,
    verbose,
    addPrintedInfo,
  })

  const iterationsD = normalizeStats(iterationsC)
  const iterationsE = addPrintedStats(iterationsD, verbose)

  const timestamp = getTimestamp(benchmark, show)

  const printedSystem = getPrintedSystem(benchmark)

  return {
    ...benchmark,
    timestamp,
    printedSystem,
    iterations: iterationsE,
    previous,
  }
}

// Only show timestamp when the `show` option is used
const getTimestamp = function({ timestamp }, show) {
  if (show === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}
