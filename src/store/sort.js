import omit from 'omit.js'
import sortOn from 'sort-on'

import { groupBy } from '../utils/group.js'

// Results are sorted by timestamp.
// However, results of the same CI build are always consecutive.
export const sortResults = function (partialResults) {
  const partialResultsA = partialResults.map(addGroup)
  const partialResultsB = groupBy(partialResultsA, 'group')
  const partialResultsC = Object.values(partialResultsB).map(addTimestamp)
  const partialResultsD = sortOn(partialResultsC, 'timestamp')
  const partialResultsE = partialResultsD
    .flatMap(getPartialResults)
    .map(removeGroup)
  return partialResultsE
}

// `partialResults` without a CI build use the `index`, i.e. are not grouped
// with others.
const addGroup = function (partialResult, index) {
  const {
    system: { ci },
  } = partialResult
  const group = ci === undefined ? String(index) : ci
  return { ...partialResult, group }
}

// Retrieve the latest partialResult's timestamp
const addTimestamp = function (partialResults) {
  // eslint-disable-next-line fp/no-mutating-methods
  const timestamps = partialResults.map(getTimestamp).sort()
  const timestamp = timestamps[timestamps.length - 1]
  return { timestamp, partialResults }
}

const getTimestamp = function ({ timestamp }) {
  return timestamp
}

const getPartialResults = function ({ partialResults }) {
  return partialResults
}

const removeGroup = function (partialResult) {
  return omit(partialResult, ['group'])
}
