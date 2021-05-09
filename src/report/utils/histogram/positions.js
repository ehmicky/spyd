import { getMean } from '../../../stats/sum.js'

// Compute positions of the median ticks.
// There can be either a single (`median`) or two (`medianLow|medianHigh`).
// Also computes `medianIndex|medianMaxWidth` used for the color gradient.
export const getMedianPositions = function (
  { median, medianLow, medianHigh, low, high },
  width,
) {
  const stats = median === undefined ? [medianLow, medianHigh] : [median]
  const medianIndexes = stats.map((stat) =>
    getMedianIndex(stat, { low, high, width }),
  )
  const positions = stats.map((stat, statIndex) => ({
    ...stat,
    index: medianIndexes[statIndex],
  }))
  const medianIndex = Math.round(getMean(medianIndexes))
  const medianMaxWidth = getMedianMaxWidth(medianIndex, width)
  return { positions, medianIndex, medianMaxWidth }
}

// When `histogram` has a single item, it is in the first bucket.
// Also compute the maximum width between the median and either the start or end
const getMedianIndex = function (median, { low, high, width }) {
  const medianPercentage =
    high.raw === low.raw ? 0 : (median.raw - low.raw) / (high.raw - low.raw)
  return Math.round((width - 1) * medianPercentage)
}

const getMedianMaxWidth = function (medianIndex, width) {
  return Math.max(medianIndex, width - 1 - medianIndex)
}
