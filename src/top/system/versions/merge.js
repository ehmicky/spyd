import { groupBy } from '../../../utils/group.js'

// Merge `result.combinations[*].dimensions.runner.versions` into
// `result.systems[*].versions`.
export const mergeSystemVersions = function (rawResult) {
  const versions = getSystemVersions(rawResult)
  return { ...rawResult, systems: [{ ...rawResult.systems[0], versions }] }
}

const getSystemVersions = function ({ combinations }) {
  const runners = combinations.map(getRunner)
  const versionsArray = Object.values(groupBy(runners, 'id')).map(
    getRunnerVersions,
  )
  return Object.assign({}, ...versionsArray)
}

const getRunner = function ({ dimensions: { runner } }) {
  return runner
}

const getRunnerVersions = function ([{ versions }]) {
  return versions
}
