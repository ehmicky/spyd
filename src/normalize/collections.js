import sortOn from 'sort-on'

import { getMean } from '../stats/sum.js'
import { groupBy } from '../utils/group.js'

// Group row/columns information into top-level properties so that reporters
// can list them.
// Also add the mean speed of each collection (using combinations medians).
export const addCollections = function (combinations) {
  return COLLECTIONS.reduce(addCollection, { combinations })
}

const COLLECTIONS = [
  { name: 'tasks', id: 'taskId', title: 'taskTitle', rank: 'taskRank' },
  { name: 'runners', id: 'runnerId', title: 'runnerTitle', rank: 'runnerRank' },
  { name: 'systems', id: 'systemId', title: 'systemTitle', rank: 'systemRank' },
]

const addCollection = function (
  { combinations, ...collections },
  { name, id, title, rank },
) {
  const collection = Object.values(
    groupBy(combinations, id),
  ).map((combinationsA) =>
    normalizeCollection({ combinations: combinationsA, id, title }),
  )
  const collectionA = sortOn(collection, 'mean')

  const combinationsB = combinations.map((combination) =>
    addRank({ combination, collection: collectionA, id, rank }),
  )
  return { combinations: combinationsB, ...collections, [name]: collectionA }
}

const normalizeCollection = function ({ combinations, id, title }) {
  const lastCombination = combinations[combinations.length - 1]
  const { [id]: collectionId, [title]: collectionTitle } = lastCombination

  const medians = combinations.map(getCombinationMedian)
  const mean = getMean(medians, 1)

  return { id: collectionId, title: collectionTitle, mean }
}

const getCombinationMedian = function ({ stats: { median } }) {
  return median
}

// Add speed rank within each collection for each combination
const addRank = function ({ combination, collection, id, rank }) {
  const rankValue = collection.findIndex((elem) => elem.id === combination[id])
  return { ...combination, [rank]: rankValue }
}
