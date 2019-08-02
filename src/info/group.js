import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

// Retrieve all tasks.
// Also compute the mean of all iterations medians (of the same task)
// The array is sorted by mean.
export const getTasks = function(iterations) {
  const tasks = groupIterations(iterations, 'taskId')
  const tasksA = tasks.map(getTask)
  return tasksA
}

const getTask = function({ groupId: taskId, mean, iteration: { title } }) {
  return { taskId, title, mean }
}

// Retrieve all parameters.
// Also compute the mean of all iterations medians (of the same parameter)
// The array is sorted by mean.
export const getParameters = function(iterations) {
  const parameters = groupIterations(iterations, 'parameter')
  const parametersA = parameters.map(getParameter)
  return parametersA
}

const getParameter = function({ groupId: parameter, mean }) {
  return { parameter, mean }
}

const groupIterations = function(iterations, groupId) {
  const groups = Object.entries(groupBy(iterations, groupId))

  const groupsA = groups.map(getGroupMean)
  sortBy(groupsA, ['mean'])
  return groupsA
}

const getGroupMean = function([groupId, iterations]) {
  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)
  const [iteration] = iterations
  return { groupId, mean, iteration }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}
