// Filter outliers.
// For sorted `measures`, this is inefficient since outliers are at the
// start/end so `minIndex|maxIndex` can be used.
// However, unsorted `unsortedMeasures` cannot do this and require filtering
// each measure. This cannot be done incrementally since outliers thresholds
// change between samples
export const filterOutliers = function (min, max, value) {
  return value >= min && value <= max
}
