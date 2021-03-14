// Serialize percentages like -5%
export const serializeRelPercentage = function (
  percentage,
  { scale, decimals },
) {
  const roundedPercentage = roundPercentage(percentage, scale, decimals)
  return `${roundedPercentage}%`
}

// Serialize percentages like ±5%
export const serializeAbsPercentage = function (
  percentage,
  { scale, decimals },
) {
  const roundedPercentage = Math.abs(
    roundPercentage(percentage, scale, decimals),
  )
  return `${ABS_PERCENTAGE_SIGN}${roundedPercentage}%`
}

// Works on CP437 too
const ABS_PERCENTAGE_SIGN = '±'

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

const roundPercentage = function (percentage, scale, decimals) {
  return (percentage / scale).toFixed(decimals)
}
