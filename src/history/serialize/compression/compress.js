import mapObj from 'map-obj'

import { cleanObject } from '../../../utils/clean.js'

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
  const combinationsA = combinations.map(compressDimensions)
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

const compressDimensions = function ({ dimensions, stats, system, versions }) {
  const dimensionsA = mapObj(dimensions, compressDimension)
  return { dimensions: dimensionsA, stats, system, versions }
}

const compressDimension = function (dimension, { id }) {
  return [dimension, id]
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
