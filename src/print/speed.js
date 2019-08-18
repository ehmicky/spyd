import { sortBy } from '../utils/sort.js'

// Add `iteration.fastest` boolean indicating fastest iterations,
// for each column (variation + command + env combination)
// Also sort iterations so the fastest tasks will be first, then the fastest
// iterations within each task (regardless of column)
export const addSpeedInfo = function(iterations) {
  sortBy(iterations, ['stats.median', ...COLUMN_RANKS])

  const iterationsA = iterations.reduce(addFastest, [])

  sortBy(iterationsA, [ROW_RANK, ...COLUMN_RANKS])

  return iterationsA
}

const ROW_RANK = 'taskRank'
const COLUMN_RANKS = ['variationRank', 'commandRank', 'envRank']

const addFastest = function(iterations, iteration) {
  const fastest = iterations.every(
    iterationA => !isSameColumn(iteration, iterationA),
  )
  return [...iterations, { ...iteration, fastest }]
}

const isSameColumn = function(iterationA, iterationB) {
  return (
    iterationA.variationId === iterationB.variationId &&
    iterationA.commandId === iterationB.commandId &&
    iterationA.envId === iterationB.envId
  )
}
