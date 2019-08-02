import { groupBy, sortBy } from '../utils.js'
import { getMean } from '../stats/methods.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ tasks, ...benchmark }) {
  const taskGroups = getTaskGroups(tasks)

  const tasksA = tasks.map(task => addTaskInfo({ task, taskGroups }))

  sortTasks(tasksA)

  return { ...benchmark, tasks: tasksA }
}

const getTaskGroups = function(tasks) {
  const taskGroups = Object.entries(groupBy(tasks, 'taskId'))

  const taskGroupsA = taskGroups.map(getTaskMean)
  sortBy(taskGroupsA, 'taskMean')
  const taskGroupsB = taskGroupsA.map(addTaskRank)

  const taskGroupsC = Object.fromEntries(taskGroupsB)
  return taskGroupsC
}

const getTaskMean = function([taskId, tasks]) {
  const medians = tasks.map(getTaskMedian)
  const taskMean = getMean(medians)
  return { taskId, taskMean }
}

const getTaskMedian = function({ stats: { median } }) {
  return median
}

const addTaskRank = function({ taskId, taskMean }, taskRank) {
  return [taskId, { taskMean, taskRank }]
}

const addTaskInfo = function({ task, task: { taskId }, taskGroups }) {
  const { taskMean, taskRank } = taskGroups[taskId]
  return { ...task, taskMean, taskRank }
}

const sortTasks = function(tasks) {
  sortBy(tasks, 'taskRank')
}
