import { cleanObject } from '../../../utils/clean.js'

import { compressDimensions } from './dimensions.js'
import { compressRunners } from './runners.js'
import { compressStats } from './stats.js'

// Reduce size of rawResults before saving.
// We persist everything so that:
//  - `show` reports the same information as `run`
//  - We do not lose any information
// We only persist what cannot be computed runtime.
// We avoid duplicating information inside the same rawResult.
// We also ensure:
//  - No additional unknown keys is persisted
//  - The keys are persisted in a specific order
export const compressRawResult = function ({
  id,
  subId,
  timestamp,
  combinations,
}) {
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

const compressCombDimensions = function ({
  dimensions,
  stats,
  system,
  versions,
}) {
  const dimensionsA = compressDimensions(dimensions)
  return { dimensions: dimensionsA, stats, system, versions }
}

const compressSystem = function ([
  {
    system: {
      machine: { os, cpus, memory },
      git: { branch, tag, commit, prNumber, prBranch },
      ci,
      versions,
    },
  },
]) {
  return {
    machine: { os, cpus, memory },
    git: { branch, tag, commit, prNumber, prBranch },
    ci,
    versions,
  }
}

const compressCombination = function ({ dimensions, stats }) {
  const statsA = compressStats(stats)
  return { dimensions, stats: statsA }
}
