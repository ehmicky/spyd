import mapObj from 'map-obj'

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
