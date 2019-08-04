import { groupBy } from '../utils/group.js'

// Add `iteration.fastest` boolean indicating fastest iterations, parameter-wise
// among all tasks
export const addFastestIterations = function(iterations) {
  return Object.values(groupBy(iterations, 'parameter')).flatMap(
    addFastestIteration,
  )
}

const addFastestIteration = function(iterations) {
  const medians = iterations.map(getIterationMedian)
  const minMedian = Math.min(...medians)
  return iterations.map(iteration => addFastest(iteration, minMedian))
}

const addFastest = function(iteration, minMedian) {
  const fastest = getIterationMedian(iteration) === minMedian
  return { ...iteration, fastest }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}
