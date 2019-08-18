import { omitBy } from '../utils/main.js'
import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

// Instead of repeating tasks/variations/commands information in each iteration,
// group them to top-level properties and make iteration point to them with
// an index instead.
// Also add the mean speed of each group (using iterations medians).
// We also sort both groups and iterations by speed.
export const addGroups = function(iterations) {
  const tasks = getGroup(iterations, 'taskId', 'taskTitle')
  const variations = getGroup(iterations, 'variationId', 'variationTitle')
  const commands = getGroup(iterations, 'commandId', 'commandTitle')
  const envs = getGroup(iterations, 'envId', 'envTitle')
  const iterationsA = iterations.map(iteration =>
    addGroupIndexes({ iteration, tasks, variations, commands, envs }),
  )

  // The fastest tasks will be first, then the fastest iterations within each
  // task (regardless of variations/commands)
  sortBy(iterationsA, ['task', 'variation', 'command', 'env'])

  return { tasks, variations, commands, envs, iterations: iterationsA }
}

const getGroup = function(iterations, id, title) {
  const groups = Object.values(groupBy(iterations, [id])).map(iterationsA =>
    normalizeGroup(iterationsA, id, title),
  )
  sortBy(groups, ['mean'])
  return groups
}

const normalizeGroup = function(iterations, id, title) {
  const [{ [id]: groupId, [title]: groupTitle }] = iterations
  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)
  return { id: groupId, title: groupTitle, mean }
}

const getIterationMedian = function({ stats: { median } }) {
  return median
}

const addGroupIndexes = function({
  iteration,
  iteration: { taskId, variationId, commandId, envId },
  tasks,
  variations,
  commands,
  envs,
}) {
  const iterationA = omitBy(iteration, key => GROUP_KEYS.includes(key))

  const taskA = tasks.findIndex(task => task.id === taskId)
  const variationA = variations.findIndex(
    variation => variation.id === variationId,
  )
  const commandA = commands.findIndex(command => command.id === commandId)
  const envA = envs.findIndex(env => env.id === envId)

  return {
    ...iterationA,
    task: taskA,
    variation: variationA,
    command: commandA,
    env: envA,
  }
}

const GROUP_KEYS = [
  'taskId',
  'taskTitle',
  'variationId',
  'variationTitle',
  'commandId',
  'commandTitle',
  'envId',
  'envTitle',
]
