import mapObj from 'map-obj'

import { cleanObject } from '../../utils/clean.js'

// Reduce size of rawResults before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
// We also ensure:
//  - No additional unknown keys is persisted
//  - The keys are persisted in a specific order
export const compressRawResult = function ({
  id,
  subId,
  timestamp,
  systems,
  combinations,
}) {
  const system = compressSystem(systems)
  const combinationsA = combinations.map(compressCombination)
  return cleanObject({
    id,
    subId,
    timestamp,
    system,
    combinations: combinationsA,
  })
}

const compressSystem = function ([
  {
    dimensions,
    machine: { os, cpus, memory },
    git: { branch, tag, commit, prNumber, prBranch },
    ci,
    versions,
  },
]) {
  const system = {
    machine: { os, cpus, memory },
    git: { branch, tag, commit, prNumber, prBranch },
    ci,
    versions,
  }
  return Object.keys(dimensions).length === 0
    ? system
    : { dimensions, ...system }
}

const compressCombination = function ({ dimensions, stats }) {
  const dimensionsA = mapObj(dimensions, compressDimension)
  const statsA = compressStats(stats)
  return { dimensions: dimensionsA, stats: statsA }
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

const compressDimension = function (dimension, { id }) {
  return [dimension, id]
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
