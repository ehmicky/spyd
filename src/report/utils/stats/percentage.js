// Serialize percentages like -5%
export const serializeRelPercentage = function (percentage) {
  const sign = REL_PERCENTAGE_SIGNS[getPercentageDirection(percentage)]
  const roundedPercentage = roundAbsPercentage(percentage)
  return `${sign}${roundedPercentage}%`
}

const REL_PERCENTAGE_SIGNS = { positive: '+', negative: '-', neutral: '' }

// Serialize percentages like ±5%
export const serializeAbsPercentage = function (percentage) {
  const roundedPercentage = roundAbsPercentage(percentage)
  return `${ABS_PERCENTAGE_SIGN}${roundedPercentage}%`
}

// Works on CP437 too
const ABS_PERCENTAGE_SIGN = '±'

// We do not distinguish between -0... and +0... because it is confusing
export const getPercentageDirection = function (percentage) {
  const roundedPercentage = roundPercentage(percentage)

  if (roundedPercentage >= 1) {
    return 'positive'
  }

  if (roundedPercentage <= -1) {
    return 'negative'
  }

  return 'neutral'
}

const roundAbsPercentage = function (percentage) {
  return Math.abs(roundPercentage(percentage))
}

const roundPercentage = function (percentage) {
  return Math.round(percentage * PERCENTAGE_SCALE)
}

const PERCENTAGE_SCALE = 1e2
