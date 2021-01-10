import omit from 'omit.js'
import sortOn from 'sort-on'

import { groupBy } from '../utils/group.js'

// Results are sorted by timestamp.
// However, results of the same CI build are always consecutive.
export const sortResults = function (results) {
  const resultsA = results.map(addGroup)
  const resultsB = groupBy(resultsA, 'group')
  const resultsC = Object.values(resultsB).map(addTimestamp)
  const resultsD = sortOn(resultsC, 'timestamp')
  const resultsE = resultsD.flatMap(getResults).map(removeGroup)
  return resultsE
}

// `results` without a CI build use the `index`, i.e. are not grouped
// with others.
const addGroup = function (result, index) {
  const {
    system: { ci },
  } = result
  const group = ci === undefined ? String(index) : ci
  return { ...result, group }
}

// Retrieve the latest result's timestamp
const addTimestamp = function (results) {
  // eslint-disable-next-line fp/no-mutating-methods
  const timestamps = results.map(getTimestamp).sort()
  const timestamp = timestamps[timestamps.length - 1]
  return { timestamp, results }
}

const getTimestamp = function ({ timestamp }) {
  return timestamp
}

const getResults = function ({ results }) {
  return results
}

const removeGroup = function (result) {
  return omit(result, ['group'])
}
