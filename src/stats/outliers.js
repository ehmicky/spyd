// Retrieve number of elements to keep from the beginning after removing
// outliers.
// The slowest measures are due to external factors:
//   - OS or runtime background periodic processes (such as garbage collection)
//   - The first measures of a specific task in a given process are slow because
//     the runtimes did not optimize it yet
export const getOutliersMax = function (array, threshold) {
  return getNonOutliersLength(array.length, threshold)
}

export const getNonOutliersLength = function (length, threshold) {
  return Math.ceil(length * threshold)
}

// How many outliers to keep.
// A higher value removes fewer outliers, which increases variance.
// A lower value removes more measures, which decreases accuracy.
export const OUTLIERS_THRESHOLD = 0.85
