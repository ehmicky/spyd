// Reduce size of results before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
export const compressResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map((combination) =>
    compressCombination({ combination }),
  )
  return { ...result, combinations: combinationsA }
}

const compressCombination = function ({
  combination,
  combination: {
    dimensions: {
      task: { id },
      runner: { runnerId },
      system: { systemId },
    },
    stats,
    stats: { histogram, quantiles, mean },
  },
}) {
  const histogramA = compressHistogram(histogram, mean)
  const quantilesA = compressQuantiles(quantiles, mean)
  return {
    ...combination,
    dimensions: { task: id, runner: runnerId, system: systemId },
    stats: { ...stats, histogram: histogramA, quantiles: quantilesA },
  }
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

// Restore original results after loading
export const decompressResult = function (result) {
  const combinations = result.combinations.map((combination) =>
    decompressCombination({ combination }),
  )
  return { ...result, combinations }
}

const decompressCombination = function ({
  combination,
  combination: {
    dimensions: { task, runner, system },
    stats,
    stats: { histogram, quantiles, mean },
  },
}) {
  const histogramA = decompressHistogram(histogram, mean)
  const quantilesA = decompressQuantiles(quantiles, mean)
  return {
    ...combination,
    dimensions: {
      task: { id: task },
      runner: { runnerId: runner },
      system: { systemId: system },
    },
    stats: { ...stats, histogram: histogramA, quantiles: quantilesA },
  }
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
