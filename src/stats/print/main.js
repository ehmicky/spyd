import { getUnit } from './unit.js'
import { getStatDecimals } from './decimals.js'
import { serializeStats } from './serialize.js'
import { addPaddings } from './padding.js'

export const addPrintedStats = function(iterations) {
  const { unit, scale } = getUnit(iterations)
  const statDecimals = getStatDecimals(iterations, scale)
  const iterationsA = iterations.map(iteration =>
    serializeStats({ iteration, unit, scale, statDecimals }),
  )
  const iterationsB = addPaddings(iterationsA)
  return iterationsB
}
