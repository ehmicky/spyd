import { resizeHistogram } from './resize.js'
import { smoothHistogram } from './smooth.js'

// Smoothes the histogram by adjusting each of those heights.
// Also resizes the columns to fit in the terminal width.
export const getFrequencies = (histogram, contentWidth, smooth) => {
  const frequencies = histogram.map(getFrequency)

  if (!smooth) {
    return resizeHistogram(frequencies, contentWidth)
  }

  const frequenciesA = smoothHistogramEnds(frequencies)
  const frequenciesB = resizeHistogram(frequenciesA, contentWidth)
  const frequenciesC = smoothHistogram(frequenciesB, SMOOTH_PERCENTAGE)
  return frequenciesC
}

const getFrequency = ({ frequency }) => frequency

// We truncate the first|last percentiles of the histogram to remove outliers.
// However, this means the first|last bucket of the truncated histogram are
// more likely to be high (or somewhat high) frequency, which gives the
// impression that the truncation removed more than just a few outliers.
// This also makes the histogram not go to the bottom on both ends, which make
// it look incomplete.
// We fix this by adding `0` buckets on both ends.
const smoothHistogramEnds = (frequencies) => [0, ...frequencies, 0]

// Smooth each bucket, by using an arithmetic mean with the nearby buckets.
// This is the number of neighbors to use, as a percentage to the total number
// of buckets.
// A higher number is more likely to hide significant useful bumps in the
// histogram.
// A lower number is less likely to smooth the histogram enough to make it
// look nice and reduce the shakiness.
const SMOOTH_PERCENTAGE = 0.05
