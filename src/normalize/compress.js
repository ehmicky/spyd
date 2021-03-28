import { getBucketEdges } from '../stats/histogram.js'

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
  const histogramA = compressHistogram(histogram)
  const statsA = { ...stats, histogram: histogramA }
  return { ...combination, stats: statsA }
}

const compressHistogram = function (histogram) {
  return histogram.map(compressBucket)
}

const compressBucket = function ({ frequency }) {
  return frequency
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
  stats: { histogram, low, high },
  ...combination
}) {
  const histogramA = decompressHistogram(histogram, low, high)
  return {
    ...combination,
    stats: { ...stats, histogram: histogramA },
  }
}

const decompressHistogram = function (histogram, low, high) {
  return getBucketEdges(low, high, histogram.length).map(
    ([start, end], bucketIndex) => ({
      start,
      end,
      frequency: histogram[bucketIndex],
    }),
  )
}
