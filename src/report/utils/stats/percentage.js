// Serialize percentages like -5%
export const serializeRelPercentage = function (
  percentage,
  { scale, decimals },
) {
  const sign = getRelPercentageSign(percentage)
  const roundedPercentage = roundPercentage(percentage, scale, decimals)
  return `${sign}${roundedPercentage}%`
}

// Serialize percentages like ±5%
export const serializeAbsPercentage = function (
  percentage,
  { scale, decimals },
) {
  const roundedPercentage = roundPercentage(percentage, scale, decimals)
  return `${ABS_PERCENTAGE_SIGN}${roundedPercentage}%`
}

// Works on CP437 too
const ABS_PERCENTAGE_SIGN = '±'

// TODO: this function is probably not needed anymore
const getRelPercentageSign = function (percentage) {
  return REL_PERCENTAGE_SIGNS[getPercentageDirection(percentage)]
}

// TODO: red/cyan colors should not be used when diff too close to 0
export const getPercentageDirection = function (percentage) {
  if (percentage > 0) {
    return 'positive'
  }

  if (percentage < 0) {
    return 'negative'
  }

  return 'neutral'
}

const REL_PERCENTAGE_SIGNS = { positive: '+', negative: '-', neutral: '' }

const roundPercentage = function (percentage, scale, decimals) {
  return Math.abs(percentage / scale).toFixed(decimals)
}
