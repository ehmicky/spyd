/* eslint-disable max-lines, no-magic-numbers */
// `varianceRatio` is:
//  - accurate for any `groupSize`, i.e. its average value is correct
//  - imprecise with lower `groupSize`, i.e. its confidence interval is wider
// We take the imprecision into account, so that groups of low `groupSize` are
// not picked more often than they should.
// eslint-disable-next-line max-statements
export const getChiSquaredValue = function (size, significanceRate) {
  const degreesOfFreedom = size - 1
  const significanceRateA = roundDecimals(significanceRate)
  const { values, higherValues } =
    CHI_SQUARED_CRITICAL_VALUES[significanceRateA]
  const value = values[degreesOfFreedom - 1]

  if (value !== undefined) {
    return degreesOfFreedom / value
  }

  const higherValueIndex = higherValues.findIndex(
    (higherValueProp) => higherValueProp.degreesOfFreedom >= degreesOfFreedom,
  )

  if (higherValueIndex === -1) {
    return (
      degreesOfFreedom /
      (significanceRate < 0.5 ? degreesOfFreedom + 1 : degreesOfFreedom - 1)
    )
  }

  const bottomValue = higherValues[higherValueIndex - 1]
  const topValue = higherValues[higherValueIndex]
  const valueA =
    (topValue.value * (degreesOfFreedom - bottomValue.degreesOfFreedom)) /
      (topValue.degreesOfFreedom - bottomValue.degreesOfFreedom) +
    (bottomValue.value * (topValue.degreesOfFreedom - degreesOfFreedom)) /
      (topValue.degreesOfFreedom - bottomValue.degreesOfFreedom)
  return degreesOfFreedom / valueA
}

// Round a number to a specific number of decimals
const roundDecimals = function (float, decimalsCount = DEFAULT_DECIMALS_COUNT) {
  const decimalsScale = 10 ** decimalsCount
  return Math.round(float * decimalsScale) / decimalsScale
}

// The default value is meant to fix Number.EPSILON rounding errors
const getDefaultDecimalsCount = function () {
  return Math.floor(-Math.log10(Number.EPSILON))
}

const DEFAULT_DECIMALS_COUNT = getDefaultDecimalsCount()

// Chi-squared critical values, with specific significance rate, single-sided
// TODO: more digits of precision
// TODO: more values
const CHI_SQUARED_CRITICAL_VALUES = {
  0.025: {
    values: [
      5.024, 7.378, 9.348, 11.143, 12.833, 14.449, 16.013, 17.535, 19.023,
      20.483, 21.92, 23.337, 24.736, 26.119, 27.488, 28.845, 30.191, 31.526,
      32.852, 34.17, 35.479, 36.781, 38.076, 39.364, 40.646, 41.923, 43.195,
      44.461, 45.722, 46.979, 48.232, 49.48, 50.725, 51.966, 53.203, 54.437,
      55.668, 56.896, 58.12, 59.342, 60.561, 61.777, 62.99, 64.201, 65.41,
      66.617, 67.821, 69.023, 70.222, 71.42, 72.616, 73.81, 75.002, 76.192,
      77.38, 78.567, 79.752, 80.936, 82.117, 83.298, 84.476, 85.654, 86.83,
      88.004, 89.177, 90.349, 91.519, 92.689, 93.856, 95.023, 96.189, 97.353,
      98.516, 99.678, 100.839, 101.999, 103.158, 104.316, 105.473, 106.629,
      107.783, 108.937, 110.09, 111.242, 112.393, 113.544, 114.693, 115.841,
      116.989, 118.136, 119.282, 120.427, 121.571, 122.715, 123.858, 125,
      126.141, 127.282, 128.422, 129.561, 130.7, 131.838, 132.975, 134.111,
      135.247, 136.382, 137.517, 138.651, 139.784, 140.917, 142.049, 143.18,
      144.311, 145.441, 146.571, 147.7, 148.829, 149.957, 151.084, 152.211,
      153.338, 154.464, 155.589, 156.714, 157.839, 158.962, 160.086, 161.209,
      162.331, 163.453, 164.575, 165.696, 166.816, 167.936, 169.056, 170.175,
      171.294, 172.412, 173.53, 174.648, 175.765, 176.882, 177.998, 179.114,
      180.229, 181.344, 182.459, 183.573, 184.687, 185.8, 186.914, 188.026,
      189.139, 190.251, 191.362, 192.474, 193.584, 194.695, 195.805, 196.915,
      198.025, 199.134, 200.243, 201.351, 202.459, 203.567, 204.675, 205.782,
      206.889, 207.995, 209.102, 210.208, 211.313, 212.419, 213.524, 214.628,
      215.733, 216.837, 217.941, 219.044, 220.148, 221.251, 222.353, 223.456,
      224.558, 225.66, 226.761, 227.863, 228.964, 230.064, 231.165, 232.265,
      233.365, 234.465, 235.564, 236.664, 237.763, 238.861, 239.96, 241.058,
      242.156, 243.254, 244.351, 245.448, 246.545, 247.642, 248.739, 249.835,
      250.931, 252.027, 253.122, 254.218, 255.313, 256.408, 257.503, 258.597,
      259.691, 260.785, 261.879, 262.973, 264.066, 265.159, 266.252, 267.345,
      268.438, 269.53, 270.622, 271.714, 272.806, 273.898, 274.989, 276.08,
      277.171, 278.262, 279.352, 280.443, 281.533, 282.623, 283.713, 284.802,
      285.892, 286.981, 288.07, 289.159, 290.248, 291.336, 292.425, 293.513,
      294.601, 295.689,
    ],
    higherValues: [
      { degreesOfFreedom: 250, value: 295.689 },
      { degreesOfFreedom: 300, value: 349.874 },
      { degreesOfFreedom: 350, value: 403.723 },
      { degreesOfFreedom: 400, value: 457.305 },
      { degreesOfFreedom: 450, value: 510.67 },
      { degreesOfFreedom: 500, value: 563.852 },
      { degreesOfFreedom: 550, value: 616.878 },
      { degreesOfFreedom: 600, value: 669.769 },
      { degreesOfFreedom: 650, value: 722.542 },
      { degreesOfFreedom: 700, value: 775.211 },
      { degreesOfFreedom: 750, value: 827.785 },
      { degreesOfFreedom: 800, value: 880.275 },
      { degreesOfFreedom: 850, value: 932.689 },
      { degreesOfFreedom: 900, value: 985.032 },
      { degreesOfFreedom: 950, value: 1037.31 },
      { degreesOfFreedom: 1000, value: 1089.53 },
      { degreesOfFreedom: 10_000, value: 10_279.7 },
      { degreesOfFreedom: 100_000, value: 100_885 },
      { degreesOfFreedom: 1_000_000, value: 1_002_805 },
    ],
  },
  0.975: {
    values: [
      0.000_982, 0.0506, 0.216, 0.484, 0.831, 1.237, 1.69, 2.18, 2.7, 3.247,
      3.816, 4.404, 5.009, 5.629, 6.262, 6.908, 7.564, 8.231, 8.907, 9.591,
      10.283, 10.982, 11.689, 12.401, 13.12, 13.844, 14.573, 15.308, 16.047,
      16.791, 17.539, 18.291, 19.047, 19.806, 20.569, 21.336, 22.106, 22.878,
      23.654, 24.433, 25.215, 25.999, 26.785, 27.575, 28.366, 29.16, 29.956,
      30.755, 31.555, 32.357, 33.162, 33.968, 34.776, 35.586, 36.398, 37.212,
      38.027, 38.844, 39.662, 40.482, 41.303, 42.126, 42.95, 43.776, 44.603,
      45.431, 46.261, 47.092, 47.924, 48.758, 49.592, 50.428, 51.265, 52.103,
      52.942, 53.782, 54.623, 55.466, 56.309, 57.153, 57.998, 58.845, 59.692,
      60.54, 61.389, 62.239, 63.089, 63.941, 64.793, 65.647, 66.501, 67.356,
      68.211, 69.068, 69.925, 70.783, 71.642, 72.501, 73.361, 74.222, 75.083,
      75.946, 76.809, 77.672, 78.536, 79.401, 80.267, 81.133, 82, 82.867,
      83.735, 84.604, 85.473, 86.342, 87.213, 88.084, 88.955, 89.827, 90.7,
      91.573, 92.446, 93.32, 94.195, 95.07, 95.946, 96.822, 97.698, 98.576,
      99.453, 100.331, 101.21, 102.089, 102.968, 103.848, 104.729, 105.609,
      106.491, 107.372, 108.254, 109.137, 110.02, 110.903, 111.787, 112.671,
      113.556, 114.441, 115.326, 116.212, 117.098, 117.985, 118.871, 119.759,
      120.646, 121.534, 122.423, 123.312, 124.201, 125.09, 125.98, 126.87,
      127.761, 128.651, 129.543, 130.434, 131.326, 132.218, 133.111, 134.003,
      134.897, 135.79, 136.684, 137.578, 138.472, 139.367, 140.262, 141.157,
      142.053, 142.949, 143.845, 144.741, 145.638, 146.535, 147.432, 148.33,
      149.228, 150.126, 151.024, 151.923, 152.822, 153.721, 154.621, 155.521,
      156.421, 157.321, 158.221, 159.122, 160.023, 160.925, 161.826, 162.728,
      163.63, 164.532, 165.435, 166.338, 167.241, 168.144, 169.047, 169.951,
      170.855, 171.759, 172.664, 173.568, 174.473, 175.378, 176.283, 177.189,
      178.095, 179.001, 179.907, 180.813, 181.72, 182.627, 183.534, 184.441,
      185.348, 186.256, 187.164, 188.072, 188.98, 189.889, 190.797, 191.706,
      192.615, 193.524, 194.434, 195.343, 196.253, 197.163, 198.073, 198.984,
      199.894, 200.805, 201.716, 202.627, 203.539, 204.45, 205.362, 206.274,
      207.186, 208.084,
    ],
    higherValues: [
      { degreesOfFreedom: 250, value: 208.084 },
      { degreesOfFreedom: 300, value: 253.912 },
      { degreesOfFreedom: 350, value: 300.064 },
      { degreesOfFreedom: 400, value: 346.482 },
      { degreesOfFreedom: 450, value: 393.118 },
      { degreesOfFreedom: 500, value: 439.936 },
      { degreesOfFreedom: 550, value: 486.91 },
      { degreesOfFreedom: 600, value: 534.019 },
      { degreesOfFreedom: 650, value: 581.245 },
      { degreesOfFreedom: 700, value: 628.577 },
      { degreesOfFreedom: 750, value: 676.003 },
      { degreesOfFreedom: 800, value: 723.513 },
      { degreesOfFreedom: 850, value: 771.099 },
      { degreesOfFreedom: 900, value: 818.756 },
      { degreesOfFreedom: 950, value: 866.477 },
      { degreesOfFreedom: 1000, value: 914.257 },
      { degreesOfFreedom: 10_000, value: 9723.8 },
      { degreesOfFreedom: 100_000, value: 99_125 },
      { degreesOfFreedom: 1_000_000, value: 997_205 },
    ],
  },
}
/* eslint-enable max-lines, no-magic-numbers */
