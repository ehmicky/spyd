import omit from 'omit.js'

// Reduce size of results before saving
// We try to persist everything, so that `show` report the same information.
// We try to only persist what cannot be computed runtime.
export const compressResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(compressCombination)
  return { ...result, combinations: combinationsA }
}

const compressCombination = function ({ stats, ...combination }) {
  const statsA = omit(stats, OMITTED_STATS_PROPS)
  return { ...combination, stats: statsA }
}

const OMITTED_STATS_PROPS = ['histogram', 'quantiles']

// Restore original results after loading
export const decompressResults = function (results) {
  return results.map(decompressResult)
}

const decompressResult = function ({ combinations, ...result }) {
  const combinationsA = combinations.map(decompressCombination)
  return { ...result, combinations: combinationsA }
}

const decompressCombination = function ({
  stats: { histogram = [], quantiles = [], ...stats },
  ...combination
}) {
  return { ...combination, stats: { ...stats, histogram, quantiles } }
}
