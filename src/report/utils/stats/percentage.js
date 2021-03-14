// Serialize percentages like -5%, 0% or +5%
export const serializeRelPercentage = function (
  percentage,
  { scale, decimals },
) {
  const roundedPercentage = (percentage / scale).toFixed(decimals)
  const plusSign = percentage > 0 ? PLUS_SIGN : ''
  return `${plusSign}${roundedPercentage}%`
}

// Serialize percentages like ±5%
export const serializeAbsPercentage = function (
  percentage,
  { scale, decimals },
) {
  const roundedPercentage = Math.abs(percentage / scale).toFixed(decimals)
  return `${ABS_PERCENTAGE_SIGN}${roundedPercentage}%`
}

// Works on CP437 too
const PLUS_SIGN = '+'
const ABS_PERCENTAGE_SIGN = '±'
