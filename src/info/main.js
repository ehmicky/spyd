import { sortBy } from '../utils.js'

import { getTaskGroups, getParameterGroups } from './group.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, ...benchmark }) {
  const taskGroups = getTaskGroups(iterations)
  const parameterGroups = getParameterGroups(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, taskGroups, parameterGroups }),
  )

  sortBy(iterationsA, ['parameterRank', 'taskRank'])

  return { ...benchmark, iterations: iterationsA }
}

const addIterationInfo = function({
  iteration,
  iteration: { taskId, parameter },
  taskGroups,
  parameterGroups,
}) {
  const { taskMean, taskRank } = taskGroups[taskId]
  const { parameterMean, parameterRank } = parameterGroups[parameter]
  return { ...iteration, taskRank, taskMean, parameterRank, parameterMean }
}
