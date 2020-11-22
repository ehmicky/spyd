import sortOn from 'sort-on'

import { getMean } from '../stats/methods.js'
import { groupBy } from '../utils/group.js'

// Group row/columns information into top-level properties so that reporters
// can list them.
// Also add the mean speed of each collection (using combinations medians).
export const addCollections = function (combinations) {
  return COLLECTIONS.reduce(addCollection, { combinations })
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
  { combinations, ...collections },
  { name, id, title, description, rank },
) {
  const collection = Object.values(groupBy(combinations, id)).map(
    (combinationsA) =>
      normalizeCollection({
        combinations: combinationsA,
        id,
        title,
        description,
      }),
  )
  const collectionA = sortOn(collection, 'mean')

  const combinationsB = combinations.map((combination) =>
    addRank({ combination, collection: collectionA, id, rank }),
  )
  return { combinations: combinationsB, ...collections, [name]: collectionA }
}

const normalizeCollection = function ({
  combinations,
  id,
  title,
  description,
}) {
  const lastCombination = combinations[combinations.length - 1]
  const {
    [id]: collectionId,
    [title]: collectionTitle,
    [description]: collectionDescription,
  } = lastCombination

  const medians = combinations.map(getCombinationMedian)
  const mean = getMean(medians)

  return {
    id: collectionId,
    title: collectionTitle,
    description: collectionDescription,
    mean,
  }
}

const getCombinationMedian = function ({ stats: { median } }) {
  return median
}

// Add speed rank within each collection for each combination
const addRank = function ({ combination, collection, id, rank }) {
  const rankValue = collection.findIndex((elem) => elem.id === combination[id])
  return { ...combination, [rank]: rankValue }
}
