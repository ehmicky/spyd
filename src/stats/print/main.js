import { getUnits } from './unit.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'

export const addPrintedStats = function(iterations) {
  const units = getUnits(iterations)
  const iterationsA = iterations.map(iteration =>
    serializeStats({ iteration, units }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
