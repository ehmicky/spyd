import { sortBy } from '../utils.js'

import { getTaskGroups } from './task_group.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, ...benchmark }) {
  const taskGroups = getTaskGroups(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, taskGroups }),
  )

  sortIterations(iterationsA)

  return { ...benchmark, iterations: iterationsA }
}

const addIterationInfo = function({
  iteration,
  iteration: { taskId },
  taskGroups,
}) {
  const { taskMean, taskRank } = taskGroups[taskId]
  return { ...iteration, taskMean, taskRank }
}

const sortIterations = function(iterations) {
  sortBy(iterations, 'taskRank')
}
