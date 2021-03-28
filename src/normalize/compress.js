import omit from 'omit.js'

// Reduce size of results before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
export const compressResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(compressCombination)
  return { ...result, combinations: combinationsA }
}

const compressCombination = function ({
  stats,
  stats: { histogram },
  ...combination
}) {
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  const histogramA = compressHistogram(histogram)
  const statsB = { ...statsA, histogram: histogramA }
  return { ...combination, stats: statsB }
}

const OMITTED_STATS_PROPS = ['quantiles']

const compressHistogram = function (histogram) {
  return histogram.map(compressBucket)
}

const compressBucket = function ({ start, end, frequency }) {
  return [start, end, frequency]
}

// Restore original results after loading
export const decompressResults = function (results) {
  return results.map(decompressResult)
}

const decompressResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(decompressCombination)
  return { ...result, combinations: combinationsA }
}

const decompressCombination = function ({
  stats,
  stats: { histogram, quantiles = [], low, high },
  ...combination
}) {
  const histogramA = decompressHistogram(histogram, low, high)
  return {
    ...combination,
    stats: { ...stats, histogram: histogramA, quantiles },
  }
}

const decompressHistogram = function (histogram, low, high) {
  const bucketCount = histogram.length
  const bucketSize = (high - low) / bucketCount
  return histogram.map((bucket, bucketIndex) =>
    decompressBucket(bucket, {
      low,
      high,
      bucketIndex,
      bucketCount,
      bucketSize,
    }),
  )
}

const decompressBucket = function (
  [, , frequency],
  { low, high, bucketIndex, bucketCount, bucketSize },
) {
  const newStart = getBucketEdge(bucketIndex - 1, {
    low,
    high,
    bucketCount,
    bucketSize,
  })
  const newEnd = getBucketEdge(bucketIndex, {
    low,
    high,
    bucketCount,
    bucketSize,
  })
  return { start: newStart, end: newEnd, frequency }
}

const getBucketEdge = function (
  bucketIndex,
  { low, high, bucketCount, bucketSize },
) {
  return bucketIndex + 1 === bucketCount
    ? high
    : low + (bucketIndex + 1) * bucketSize
}
