import mapObj from 'map-obj'

// Reduce size of rawResults before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
// We ensure the keys are persisted in a specific order
export const compressRawResult = function ({
  systems,
  combinations,
  ...rawResult
}) {
  const system = compressSystem(systems)
  const combinationsA = combinations.map((combination) =>
    compressCombination(combination),
  )
  return { ...rawResult, system, combinations: combinationsA }
}

const compressSystem = function ([{ dimensions, ...system }]) {
  return Object.keys(dimensions).length === 0
    ? system
    : { dimensions, ...system }
}

const compressCombination = function ({
  dimensions,
  stats,
  stats: { histogram, quantiles, mean },
  ...combination
}) {
  const dimensionsA = mapObj(dimensions, compressDimension)
  const histogramA = compressHistogram(histogram, mean)
  const quantilesA = compressQuantiles(quantiles, mean)
  return {
    ...combination,
    dimensions: dimensionsA,
    stats: { ...stats, histogram: histogramA, quantiles: quantilesA },
  }
}

const compressDimension = function (dimension, { id }) {
  return [dimension, id]
}

const compressHistogram = function (histogram, mean) {
  return histogram.map((bucket) => compressBucket(bucket, mean))
}

const compressQuantiles = function (quantiles, mean) {
  return quantiles.map((quantile) => quantile - mean)
}

const compressBucket = function ({ start, end, frequency }, mean) {
  return [start - mean, end - mean, frequency]
}

// Restore original rawResults after loading
export const decompressRawResult = function (rawResult) {
  const rawResultA = decompressSystem(rawResult)
  const combinations = rawResultA.combinations.map((combination) =>
    decompressCombination({ combination }),
  )
  return { ...rawResultA, combinations }
}

const decompressSystem = function ({
  system,
  system: { dimensions = {} },
  ...rawResult
}) {
  return { ...rawResult, systems: [{ ...system, dimensions }] }
}

const decompressCombination = function ({
  combination: {
    dimensions,
    stats,
    stats: { histogram, quantiles, mean },
  },
  combination,
}) {
  const dimensionsA = mapObj(dimensions, decompressDimension)
  const histogramA = decompressHistogram(histogram, mean)
  const quantilesA = decompressQuantiles(quantiles, mean)
  return {
    ...combination,
    dimensions: dimensionsA,
    stats: { ...stats, histogram: histogramA, quantiles: quantilesA },
  }
}

const decompressDimension = function (dimension, id) {
  return [dimension, { id }]
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
