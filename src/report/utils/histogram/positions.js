import { getMean } from '../../../stats/sum.js'

// Compute positions of the median ticks.
// There can be either a single (`median`) or two (`medianMin|medianMax`).
// Also computes `medianIndex|medianMaxWidth` used for the color gradient.
export const getMedianPositions = function (
  { median, medianMin, medianMax, min, max },
  width,
) {
  const stats = medianMin === undefined ? [median] : [medianMin, medianMax]
  const medianIndexes = stats.map((stat) =>
    getMedianIndex(stat, { min, max, width }),
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
const getMedianIndex = function (median, { min, max, width }) {
  const medianPercentage =
    max.raw === min.raw ? 0 : (median.raw - min.raw) / (max.raw - min.raw)
  return Math.round((width - 1) * medianPercentage)
}

const getMedianMaxWidth = function (medianIndex, width) {
  return Math.max(medianIndex, width - 1 - medianIndex)
}
