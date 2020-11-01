import sortOn from 'sort-on'

// Add `iteration.fastest` boolean indicating fastest iterations,
// for each column (variation + command + system combination)
// Also sort iterations so the fastest tasks will be first, then the fastest
// iterations within each task (regardless of column)
export const addSpeedInfo = function (iterations) {
  const iterationsA = sortOn(iterations, ['stats.median', ...COLUMN_RANKS])
  const iterationsB = iterationsA.reduce(addFastest, [])
  const iterationsC = sortOn(iterationsB, [ROW_RANK, ...COLUMN_RANKS])
  return iterationsC
}

const ROW_RANK = 'taskRank'
const COLUMN_RANKS = ['variationRank', 'commandRank', 'systemRank']

const addFastest = function (iterations, iteration) {
  const fastest = iterations.every(
    (iterationA) => !isSameColumn(iteration, iterationA),
  )
  return [...iterations, { ...iteration, fastest }]
}

const isSameColumn = function (iterationA, iterationB) {
  return (
    iterationA.variationId === iterationB.variationId &&
    iterationA.commandId === iterationB.commandId &&
    iterationA.systemId === iterationB.systemId
  )
}
