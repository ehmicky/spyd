// Compute position of the median tick.
// When `histogram` has a single item, it is in the first bucket.
// Also compute the maximum width between the median and either the start or end
export const getMedianPosition = function ({ median, low, high, width }) {
  const medianPercentage = high === low ? 0 : (median - low) / (high - low)
  const indexWidth = width - 1
  const medianIndex = Math.round(indexWidth * medianPercentage)
  const medianMaxWidth = Math.max(medianIndex, indexWidth - medianIndex)
  return { medianIndex, medianMaxWidth }
}
