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

export const roundAbsPercentage = function (percentage) {
  return Math.abs(roundPercentage(percentage))
}

const roundPercentage = function (percentage) {
  return Math.round(percentage * PERCENTAGE_SCALE)
}

const PERCENTAGE_SCALE = 1e2
