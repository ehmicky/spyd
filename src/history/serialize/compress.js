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

const compressStats = function ({
  mean,
  meanMin,
  meanMax,
  median,
  min,
  max,
  stdev,
  rstdev,
  rmoe,
  moe,
  cold,
  outliersMin,
  outliersMax,
  envDev,
  samples,
  loops,
  times,
  repeat,
  minLoopDuration,
  runDuration,
  quantiles,
  histogram,
}) {
  const quantilesA = compressQuantiles(quantiles, mean)
  const histogramA = compressHistogram(histogram, mean)
  return {
    mean,
    meanMin,
    meanMax,
    median,
    min,
    max,
    stdev,
    rstdev,
    moe,
    rmoe,
    cold,
    outliersMin,
    outliersMax,
    envDev,
    samples,
    loops,
    times,
    repeat,
    minLoopDuration,
    runDuration,
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
