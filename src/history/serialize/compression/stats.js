// Compress `result.combinations[*].stats`
export const compressStats = (stats) => {
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

const compressQuantiles = (quantiles, mean) =>
  quantiles.map((quantile) => quantile - mean)

const compressHistogram = (histogram, mean) =>
  histogram.map((bucket) => compressBucket(bucket, mean))

const compressBucket = ({ start, end, frequency }, mean) => [
  start - mean,
  end - mean,
  frequency,
]

// Decompress `result.combinations[*].stats`
export const decompressStats = (stats) => {
  const histogramA = decompressHistogram(stats.histogram, stats.mean)
  const quantilesA = decompressQuantiles(stats.quantiles, stats.mean)
  return { ...stats, histogram: histogramA, quantiles: quantilesA }
}

const decompressHistogram = (histogram, mean) =>
  histogram === undefined
    ? undefined
    : histogram.map((bucket) => decompressBucket(bucket, mean))

const decompressBucket = ([start, end, frequency], mean) => ({
  start: start + mean,
  end: end + mean,
  frequency,
})

const decompressQuantiles = (quantiles, mean) =>
  quantiles.map((quantile) => quantile + mean)
