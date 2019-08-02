import { getUnits } from './unit.js'
import { addIterationStats } from './serialize.js'
import { addPaddings } from './padding.js'

export const addPrintedStats = function(iterations) {
  const units = getUnits(iterations)
  const iterationsA = iterations.map(iteration =>
    addIterationStats({ iteration, units }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
