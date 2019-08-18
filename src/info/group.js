import { omitBy } from '../utils/main.js'
import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

export const addGroups = function(iterations) {
  const tasks = getGroup(iterations, 'taskId', 'taskTitle')
  const variations = getGroup(iterations, 'variationId', 'variationTitle')
  const commands = getGroup(iterations, 'commandId', 'commandTitle')
  const iterationsA = iterations.map(iteration =>
    addGroupIndexes({ iteration, tasks, variations, commands }),
  )

  // The fastest tasks will be first, then the fastest iterations within each
  // task (regardless of variants or runners)
  sortBy(iterationsA, ['task', 'stats.median'])

  return { tasks, variations, commands, iterations: iterationsA }
}

// Retrieve all tasks/variations/commands.
// Also compute the mean of all iterations medians (of the same group)
// The array is sorted by mean.
const getGroup = function(iterations, id, title) {
  const groups = Object.values(groupBy(iterations, [id])).map(iterationsA =>
    normalizeGroup({ id, title, iterations: iterationsA }),
  )
  sortBy(groups, ['mean'])
  return groups
}

const normalizeGroup = function({
  id,
  title,
  iterations,
  iterations: [{ [id]: groupId, [title]: groupTitle }],
}) {
  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)
  return { [id]: groupId, [title]: groupTitle, mean }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

// Replace group id/title by index towards top-level group
const addGroupIndexes = function({
  iteration,
  iteration: { taskId, variationId, commandId },
  tasks,
  variations,
  commands,
}) {
  const iterationA = omitBy(iteration, key => GROUP_KEYS.includes(key))

  const taskA = tasks.findIndex(task => task.taskId === taskId)
  const variationA = variations.findIndex(
    variation => variation.variationId === variationId,
  )
  const commandA = commands.findIndex(
    variation => variation.commandId === commandId,
  )
  return {
    ...iterationA,
    task: taskA,
    variation: variationA,
    command: commandA,
  }
}

const GROUP_KEYS = [
  'taskId',
  'taskTitle',
  'variationId',
  'variationTitle',
  'commandId',
  'commandTitle',
]
