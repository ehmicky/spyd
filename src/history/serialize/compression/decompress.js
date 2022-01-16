import mapObj from 'map-obj'

import { decompressRunners } from './runners.js'
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

const decompressDimension = function (dimension, id) {
  return [dimension, { id }]
}
