import { groupBy, sortBy } from '../utils.js'
import { getMean } from '../stats/methods.js'

// Group iterations by `taskId` and compute:
//  - `taskMean`: mean of all iterations medians (of the same task)
//  - `taskRank`: rank among all `taskMean`
export const getTaskGroups = function(iterations) {
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
