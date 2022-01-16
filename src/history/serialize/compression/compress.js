import mapObj from 'map-obj'

import { cleanObject } from '../../utils/clean.js'
import { groupBy } from '../../utils/group.js'

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

const compressRunners = function (combinations) {
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

const compressCombination = function ({ dimensions, stats }) {
  const statsA = compressStats(stats)
  return { dimensions, stats: statsA }
}

const compressStats = function (stats) {
  const quantilesA = compressQuantiles(stats.quantiles, stats.mean)
  const histogramA = compressHistogram(stats.histogram, stats.mean)
  return {
    mean: stats.mean,
    meanMin: stats.meanMin,
    meanMax: stats.meanMax,
    median: stats.median,
    min: stats.min,
    max: stats.max,
    stdev: stats.stdev,
    rstdev: stats.rstdev,
    moe: stats.moe,
    rmoe: stats.rmoe,
    cold: stats.cold,
    outliersMin: stats.outliersMin,
    outliersMax: stats.outliersMax,
    envDev: stats.envDev,
    samples: stats.samples,
    loops: stats.loops,
    times: stats.times,
    repeat: stats.repeat,
    minLoopDuration: stats.minLoopDuration,
    runDuration: stats.runDuration,
    quantiles: quantilesA,
    histogram: histogramA,
  }
}

const compressQuantiles = function (quantiles, mean) {
  return quantiles.map((quantile) => quantile - mean)
}

const compressHistogram = function (histogram, mean) {
  return histogram.map((bucket) => compressBucket(bucket, mean))
}

const compressBucket = function ({ start, end, frequency }, mean) {
  return [start - mean, end - mean, frequency]
}
