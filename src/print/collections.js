import { groupBy } from '../utils/group.js'
import { sortBy } from '../utils/sort.js'
import { getMean } from '../stats/methods.js'

// Group row/columns information into top-level properties so that reporters
// can list them.
// Also add the mean speed of each group (using iterations medians).
export const addCollections = function(iterations) {
  return GROUPS.reduce(addGroup, { iterations })
}

const GROUPS = [
  { groupName: 'tasks', id: 'taskId', title: 'taskTitle', rank: 'taskRank' },
  {
    groupName: 'variations',
    id: 'variationId',
    title: 'variationTitle',
    rank: 'variationRank',
  },
  {
    groupName: 'commands',
    id: 'commandId',
    title: 'commandTitle',
    rank: 'commandRank',
  },
  { groupName: 'envs', id: 'envId', title: 'envTitle', rank: 'envRank' },
]

const addGroup = function(
  { iterations, ...groups },
  { groupName, id, title, rank },
) {
  const group = Object.values(groupBy(iterations, id)).map(iterationsA =>
    normalizeGroup(iterationsA, id, title),
  )
  sortBy(group, ['mean'])

  const iterationsB = iterations.map(iteration =>
    addRank({ iteration, group, id, rank }),
  )
  return { iterations: iterationsB, ...groups, [groupName]: group }
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

// Add speed rank within each group for each iteration
const addRank = function({ iteration, group, id, rank }) {
  const rankValue = group.findIndex(elem => elem.id === iteration[id])
  return { ...iteration, [rank]: rankValue }
}
