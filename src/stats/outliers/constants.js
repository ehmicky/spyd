// Constants/parameters controlling the outliers logic

// Number of quantiles to use to find outliersMin|outliersMax.
// The algorithm is chosen so that changing the granularity does not
// significantly change the final result.
// A higher value it slower to compute
//  - The time complexity is roughly linear
// A lower value makes the value:
//  - Less granular, i.e. outlier percentages changes from samples to samples
//    will be higher
//     - The minimum change is determined by
//       1 / (OUTLIERS_GRANULARITY * THRESHOLDS_COUNT)
//     - For example, with OUTLIERS_GRANULARITY 2e3 and THRESHOLDS_COUNT 10,
//       outliersMin|outliersMax granularity is 0.005%
//  - Less accurate
//  - More variable
export const OUTLIERS_GRANULARITY = 2e3

// Maximum percentage of min|max outliers.
// This is applied independently on outliersMax and outliersMin so they do not
// influence each other.
// When the sample size is very low, we allow 1 outlier on each side:
//  - This ensures cold starts are removed
//  - This might result in higher outlier percentages than allowed below
// A higher value:
//  - Is more likely to result in very high outlier percentages on some edge
//    cases, for example on a distribution with a continuous, very exponential
//    slope.
//  - Is more likely to include significant data instead of outliers only.
// A lower value reduces the benefits of outliers removal.
export const OUTLIERS_LIMIT = 0.05

// If the following minimum amount of measures leads to >= 50% width reduction,
// they are considered outliers.
// A higher value:
//  - Is less accurate as more information is trimmed
//  - Is more likely to oscillate between bigger outlier threshold values,
//    making the mean, stdev and histogram flicker between different values.
// A lower value:
//  - Is less precise as outliers will have a higher impact on the mean.
//  - Results in wider quantiles, i.e. poorer histograms
export const THRESHOLDS_BASE_AMOUNT = 0.01

// Number of different outliers thresholds to use.
// A higher value is slower to compute.
//  - This follows a logarithmic time complexity since each threshold re-uses
//    the outliers removal from the previous threshold
// A lower value decreases the general smoothing effect.
export const THRESHOLDS_COUNT = 1e2

// Multiplying factor between the base threshold and the min|max ones.
// A higher value:
//  - Decreases the accuracy of the outliers removal, making it more
//    likely to trim too many or not enough outliers.
//  - Makes it more likely to hit to outliersLimit, making it trim even less
//    outliers
// A lower value decreases the maximum size of "stop points" that can benefit
// from the smoothing effect.
export const THRESHOLDS_SPREAD = 2
