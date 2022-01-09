import mapObj from 'map-obj'

// Restore original rawResults after loading
export const decompressRawResult = function ({
  id,
  subId,
  timestamp,
  system,
  combinations,
}) {
  const combinationsA = combinations.map((combination) =>
    decompressCombination(combination, system),
  )
  return { id, subId, timestamp, combinations: combinationsA }
}

const decompressCombination = function (
  { dimensions, stats, versions },
  system,
) {
  const dimensionsA = mapObj(dimensions, decompressDimension)
  const statsA = decompressStats(stats)
  return { dimensions: dimensionsA, stats: statsA, system, versions }
}

const decompressDimension = function (dimension, id) {
  return [dimension, { id }]
}

const decompressStats = function (stats) {
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
