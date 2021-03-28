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
  stats: { histogram, quantiles = [], ...stats },
  ...combination
}) {
  const histogramA = decompressHistogram(histogram)
  return {
    ...combination,
    stats: { ...stats, histogram: histogramA, quantiles },
  }
}

const decompressHistogram = function (histogram) {
  return histogram.map(decompressBucket)
}

const decompressBucket = function ([start, end, frequency]) {
  return { start, end, frequency }
}
