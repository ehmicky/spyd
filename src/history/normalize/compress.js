import mapObj from 'map-obj'

// Reduce size of rawResults before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
// We ensure the keys are persisted in a specific order
export const compressRawResult = function ({
  id,
  subId,
  timestamp,
  systems,
  combinations,
}) {
  const system = compressSystem(systems)
  const combinationsA = combinations.map((combination) =>
    compressCombination(combination),
  )
  return { id, subId, timestamp, system, combinations: combinationsA }
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
