import { groupBy } from '../../../utils/group.js'

// Compress `result.combinations[*].versions` to `result.runners[*].versions`
export const compressRunners = (combinations) => {
  const combinationsGroups = Object.values(groupBy(combinations, getRunnerKey))
  return combinationsGroups.map(compressRunner)
}

const getRunnerKey = ({ dimensions: { runner } }) => runner

const compressRunner = ([
  {
    dimensions: { runner },
    versions,
  },
]) => ({ dimensions: { runner }, versions })

// Decompress `result.runners[*].versions` to `result.combinations[*].versions`
export const decompressRunners = (runners, dimensions) => {
  const { versions } = runners.find((runner) =>
    isCombinationRunner(runner, dimensions),
  )
  return versions
}

const isCombinationRunner = (runner, dimensions) =>
  Object.entries(runner.dimensions).every(
    ([dimensionName, id]) => dimensions[dimensionName] === id,
  )
