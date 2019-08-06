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

const getTask = function({ groupId: taskId, mean, iteration: { taskTitle } }) {
  return { taskId, taskTitle, mean }
}

// Same for variations
export const getVariations = function(iterations) {
  const variations = groupIterations(iterations, 'variationId')
  const variationsA = variations.map(getVariation)
  return variationsA
}

const getVariation = function({
  groupId: variationId,
  mean,
  iteration: { variationTitle },
}) {
  return { variationId, variationTitle, mean }
}

// Same for runners
export const getRunners = function(iterations) {
  const runners = groupIterations(iterations, 'runnerId')
  const runnersA = runners.map(getRunner)
  return runnersA
}

const getRunner = function({
  groupId: runnerId,
  mean,
  iteration: { runnerTitle },
}) {
  return { runnerId, runnerTitle, mean }
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
