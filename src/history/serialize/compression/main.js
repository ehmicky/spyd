import { cleanObject } from '../../../utils/clean.js'

import { compressDimensions, decompressDimensions } from './dimensions.js'
import { compressRunners, decompressRunners } from './runners.js'
import { compressStats, decompressStats } from './stats.js'

// Reduce size of rawResults before saving.
// We persist everything so that:
//  - `show` reports the same information as `run`
//  - We do not lose any information
// We only persist what cannot be computed runtime.
// We avoid duplicating information inside the same rawResult.
// We also ensure:
//  - No additional unknown keys is persisted
//  - The keys are persisted in a specific order
export const compressRawResult = ({ id, subId, timestamp, combinations }) => {
  const combinationsA = combinations.map(compressCombDimensions)
  const system = compressSystem(combinationsA)
  const runners = compressRunners(combinationsA)
  const combinationsB = combinationsA.map(compressCombination)
  return cleanObject({
    id,
    subId,
    timestamp,
    system,
    runners,
    combinations: combinationsB,
  })
}

const compressCombDimensions = ({ dimensions, stats, system, versions }) => {
  const dimensionsA = compressDimensions(dimensions)
  return { dimensions: dimensionsA, stats, system, versions }
}

const compressSystem = ([
  {
    system: {
      machine: { os, cpus, memory },
      git: { branch, tag, commit, prNumber, prBranch },
      ci,
      versions,
    },
  },
]) => ({
  machine: { os, cpus, memory },
  git: { branch, tag, commit, prNumber, prBranch },
  ci,
  versions,
})

const compressCombination = ({ dimensions, stats }) => {
  const statsA = compressStats(stats)
  return { dimensions, stats: statsA }
}

// Restore original rawResults after loading
export const decompressRawResult = ({
  id,
  subId,
  timestamp,
  system,
  runners,
  combinations,
}) => {
  const combinationsA = combinations.map((combination) =>
    decompressCombination(combination, system, runners),
  )
  return { id, subId, timestamp, combinations: combinationsA }
}

const decompressCombination = ({ dimensions, stats }, system, runners) => {
  const versions = decompressRunners(runners, dimensions)
  const dimensionsA = decompressDimensions(dimensions)
  const statsA = decompressStats(stats)
  return { dimensions: dimensionsA, stats: statsA, system, versions }
}
