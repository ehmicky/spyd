import mapObj from 'map-obj'

// Restore original rawResults after loading
export const decompressRawResult = function (rawResult) {
  const rawResultA = decompressSystem(rawResult)
  const combinations = rawResultA.combinations.map(decompressCombination)
  return { ...rawResultA, combinations }
}

const decompressSystem = function ({
  system,
  system: { dimensions = {} },
  ...rawResult
}) {
  return { ...rawResult, systems: [{ ...system, dimensions }] }
}

const decompressCombination = function (combination) {
  const dimensions = mapObj(combination.dimensions, decompressDimension)
  const stats = decompressStats(combination.stats)
  return { ...combination, dimensions, stats }
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
