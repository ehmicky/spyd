import { getUnit } from './unit.js'
import { getStatsDecimals } from './decimals.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'
import { getPrintedSystem } from './system.js'

// Add serialized information for CLI reporters
export const getPrintedInfo = function(iterations, system, { verbose }) {
  const iterationsA = addPrintedStats(iterations, verbose)
  const printedSystem = getPrintedSystem(system)
  return { iterations: iterationsA, printedSystem }
}

// Add `iteration.printedStats` which is like `iteration.stats` but serialized
// and CLI-reporter-friendly. It adds time units, rounding, padding and ensures
// proper vertical alignment.
const addPrintedStats = function(iterations, verbose) {
  const { unit, scale } = getUnit(iterations)
  const statsDecimals = getStatsDecimals(iterations, scale)
  const iterationsA = iterations.map(iteration =>
    serializeStats({ iteration, unit, scale, statsDecimals, verbose }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
