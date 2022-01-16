import { groupBy } from '../../../utils/group.js'

// Compress `result.combinations[*].versions` to `result.runners[*].versions`
export const compressRunners = function (combinations) {
  const combinationsGroups = Object.values(groupBy(combinations, getRunnerKey))
  return combinationsGroups.map(compressRunner)
}

const getRunnerKey = function ({ dimensions: { runner } }) {
  return runner
}

const compressRunner = function ([
  {
    dimensions: { runner },
    versions,
  },
]) {
  return { dimensions: { runner }, versions }
}

// Decompress `result.runners[*].versions` to `result.combinations[*].versions`
export const decompressRunners = function (runners, dimensions) {
  const { versions } = runners.find((runner) =>
    isCombinationRunner(runner, dimensions),
  )
  return versions
}

const isCombinationRunner = function (runner, dimensions) {
  return Object.entries(runner.dimensions).every(
    ([dimensionName, id]) => dimensions[dimensionName] === id,
  )
}
