// Retrieve number of elements to keep from the beginning after removing
// outliers
export const getOutliersMax = function (array, threshold) {
  return Math.ceil(array.length * threshold)
}

// How many outliers to keep.
// A higher value removes fewer outliers, which increases variance.
// A lower value removes more measures, which decreases accuracy.
export const OUTLIERS_THRESHOLD = 0.85
