import { getMean } from '../../../stats/sum.js'

// Compute positions of the mean ticks.
// There can be either a single (`mean`) or two (`meanMin|meanMax`).
// Also computes `meanIndex|meanMaxWidth` used for the color gradient.
export const getMedianPositions = function (
  { mean, meanMin, meanMax, min, max },
  width,
) {
  const stats = meanMin === undefined ? [mean] : [meanMin, meanMax]
  const meanIndexes = stats.map((stat) =>
    getMeanIndex(stat, { min, max, width }),
  )
  const positions = stats.map((stat, statIndex) => ({
    ...stat,
    index: meanIndexes[statIndex],
  }))
  const meanIndex = Math.round(getMean(meanIndexes))
  const meanMaxWidth = getMeanMaxWidth(meanIndex, width)
  return { positions, meanIndex, meanMaxWidth }
}

// When `histogram` has a single item, it is in the first bucket.
// Also compute the maximum width between the mean and either the start or end
const getMeanIndex = function (mean, { min, max, width }) {
  const meanPercentage =
    max.raw === min.raw ? 0 : (mean.raw - min.raw) / (max.raw - min.raw)
  return Math.round((width - 1) * meanPercentage)
}

const getMeanMaxWidth = function (meanIndex, width) {
  return Math.max(meanIndex, width - 1 - meanIndex)
}
