import sortOn from 'sort-on'

// Results are sorted by timestamp.
// However, results of the same CI build are always consecutive.
export const sortResults = function (results) {
  const resultsGroups = groupResults(results)
  const resultsGroupsA = resultsGroups.map(addTimestamp)
  const resultsGroupsB = sortOn(resultsGroupsA, 'timestamp')
  // eslint-disable-next-line fp/no-mutating-methods
  const resultsA = resultsGroupsB.flatMap(getResults).sort().reverse()
  return resultsA
}

const groupResults = function (results) {
  const groups = [...new Set(results.map(getGroup))]
  return groups.map((group) => results.filter(isGroup.bind(undefined, group)))
}

const isGroup = function (group, result, index) {
  return getGroup(result, index) === group
}

// `results` without a CI build use the `index`, i.e. are not grouped
// with others.
const getGroup = function ({ system: { ci } }, index) {
  return ci === undefined ? String(index) : ci
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
