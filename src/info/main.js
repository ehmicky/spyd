import { groupBy, sortBy } from '../utils.js'
import { getMean } from '../stats/methods.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, ...benchmark }) {
  const taskGroups = getTaskGroups(iterations)

  const iterationsA = iterations.map(iteration =>
    addIterationInfo({ iteration, taskGroups }),
  )

  sortIterations(iterationsA)

  return { ...benchmark, iterations: iterationsA }
}

const getTaskGroups = function(iterations) {
  const taskGroups = Object.entries(groupBy(iterations, 'taskId'))

  const taskGroupsA = taskGroups.map(getTaskMean)
  sortBy(taskGroupsA, 'taskMean')
  const taskGroupsB = taskGroupsA.map(addTaskRank)

  const taskGroupsC = Object.fromEntries(taskGroupsB)
  return taskGroupsC
}

const getTaskMean = function([taskId, iterations]) {
  const medians = iterations.map(getIterationMedian)
  const taskMean = getMean(medians)
  return { taskId, taskMean }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

const addTaskRank = function({ taskId, taskMean }, taskRank) {
  return [taskId, { taskMean, taskRank }]
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
