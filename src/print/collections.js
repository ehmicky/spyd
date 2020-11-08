import sortOn from 'sort-on'

import { getMean } from '../stats/methods.js'
import { groupBy } from '../utils/group.js'

// Group row/columns information into top-level properties so that reporters
// can list them.
// Also add the mean speed of each collection (using iterations medians).
export const addCollections = function (iterations) {
  return COLLECTIONS.reduce(addCollection, { iterations })
}

const COLLECTIONS = [
  { name: 'tasks', id: 'taskId', title: 'taskTitle', rank: 'taskRank' },
  { name: 'inputs', id: 'inputId', title: 'inputTitle', rank: 'inputRank' },
  {
    name: 'commands',
    id: 'commandId',
    title: 'commandTitle',
    description: 'commandDescription',
    rank: 'commandRank',
  },
  { name: 'systems', id: 'systemId', title: 'systemTitle', rank: 'systemRank' },
]

const addCollection = function (
  { iterations, ...collections },
  { name, id, title, description, rank },
) {
  const collection = Object.values(groupBy(iterations, id)).map((iterationsA) =>
    normalizeCollection({ iterations: iterationsA, id, title, description }),
  )
  const collectionA = sortOn(collection, 'mean')

  const iterationsB = iterations.map((iteration) =>
    addRank({ iteration, collection: collectionA, id, rank }),
  )
  return { iterations: iterationsB, ...collections, [name]: collectionA }
}

const normalizeCollection = function ({ iterations, id, title, description }) {
  const lastIteration = iterations[iterations.length - 1]
  const {
    [id]: collectionId,
    [title]: collectionTitle,
    [description]: collectionDescription,
  } = lastIteration

  const medians = iterations.map(getIterationMedian)
  const mean = getMean(medians)

  return {
    id: collectionId,
    title: collectionTitle,
    description: collectionDescription,
    mean,
  }
}

const getIterationMedian = function ({ stats: { median } }) {
  return median
}

// Add speed rank within each collection for each iteration
const addRank = function ({ iteration, collection, id, rank }) {
  const rankValue = collection.findIndex((elem) => elem.id === iteration[id])
  return { ...iteration, [rank]: rankValue }
}
