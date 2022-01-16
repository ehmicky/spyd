// Compress `result.combinations[*].stats`
export const compressStats = function (stats) {
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

// Decompress `result.combinations[*].stats`
export const decompressStats = function (stats) {
  const histogramA = decompressHistogram(stats.histogram, stats.mean)
  const quantilesA = decompressQuantiles(stats.quantiles, stats.mean)
  return { ...stats, histogram: histogramA, quantiles: quantilesA }
}

const decompressHistogram = function (histogram, mean) {
  return histogram === undefined
    ? undefined
    : histogram.map((bucket) => decompressBucket(bucket, mean))
}

const decompressBucket = function ([start, end, frequency], mean) {
  return { start: start + mean, end: end + mean, frequency }
}

const decompressQuantiles = function (quantiles, mean) {
  return quantiles.map((quantile) => quantile + mean)
}
