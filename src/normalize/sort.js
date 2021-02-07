import sortOn from 'sort-on'

import { sortFloats } from '../stats/sort.js'
import { groupBy } from '../utils/group.js'

// Results are sorted by timestamp.
// However, results of the same CI build are always consecutive.
export const sortResults = function (results) {
  const resultsGroups = Object.values(groupBy(results, getGroup))
  const resultsGroupsA = resultsGroups.map(addTimestamp)
  const resultsGroupsB = sortOn(resultsGroupsA, 'timestamp')
  // eslint-disable-next-line fp/no-mutating-methods
  const resultsA = resultsGroupsB.flatMap(getResults).sort()
  return resultsA
}

// `results` without a CI build use the `index`, i.e. are not grouped
// with others.
const getGroup = function ({ systems: [{ ci }] }, index) {
  return ci === undefined ? String(index) : ci
}

// Retrieve the latest result's timestamp
const addTimestamp = function (results) {
  const timestamps = results.map(getTimestamp)
  sortFloats(timestamps)
  const timestamp = timestamps[timestamps.length - 1]
  return { timestamp, results }
}

const getTimestamp = function ({ timestamp }) {
  return timestamp
}

const getResults = function ({ results }) {
  return results
}
