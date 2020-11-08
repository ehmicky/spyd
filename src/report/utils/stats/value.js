// Serialize a stat's value
export const serializeValue = function ({ stat, type, scale, unit, decimals }) {
  return SERIALIZE_STAT[type](stat, { scale, unit, decimals })
}

const serializeCount = function (stat) {
  // Adds thousands separators
  return stat.toLocaleString()
}

const serializePercentage = function (stat) {
  const percentage = Math.abs(Math.floor(stat * PERCENTAGE_SCALE))
  return `${percentage}%`
}

const PERCENTAGE_SCALE = 1e2

const serializeDuration = function (stat, { scale, unit, decimals }) {
  const scaledStat = stat / scale
  const integer = Math.floor(scaledStat)
  const fraction = getFraction({ scaledStat, integer, decimals })
  return `${integer}${fraction}${unit}`
}

const getFraction = function ({ scaledStat, integer, decimals }) {
  if (Number.isInteger(scaledStat) || decimals === 0) {
    return ''
  }

  return (scaledStat - integer).toFixed(decimals).slice(1)
}

const SERIALIZE_STAT = {
  count: serializeCount,
  percentage: serializePercentage,
  duration: serializeDuration,
}
