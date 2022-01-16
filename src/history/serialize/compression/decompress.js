import mapObj from 'map-obj'

import { decompressStats } from './stats.js'

// Restore original rawResults after loading
export const decompressRawResult = function ({
  id,
  subId,
  timestamp,
  system,
  runners,
  combinations,
}) {
  const combinationsA = combinations.map((combination) =>
    decompressCombination(combination, system, runners),
  )
  return { id, subId, timestamp, combinations: combinationsA }
}

const decompressCombination = function (
  { dimensions, stats },
  system,
  runners,
) {
  const versions = decompressRunners(runners, dimensions)
  const dimensionsA = mapObj(dimensions, decompressDimension)
  const statsA = decompressStats(stats)
  return { dimensions: dimensionsA, stats: statsA, system, versions }
}

const decompressRunners = function (runners, dimensions) {
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

const decompressDimension = function (dimension, id) {
  return [dimension, { id }]
}
