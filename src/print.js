export const printStats = function(stats, allStats = [stats]) {
  const statsStr = Object.entries(stats)
    .filter(([name]) => !['times', 'percentiles', 'histogram'].includes(name))
    .map(([name, value]) => printStat(name, value, allStats))
    .join(' | ')
  console.log(statsStr)
}

const printStat = function(name, value, allStats) {
  const otherStats = allStats.map(stats => stats[name])
  const intDigits = otherStats.map(stat =>
    String(stat).includes('.') ? String(stat).indexOf('.') : 1,
  )
  const padding = Math.max(...intDigits)

  const numberInts = String(value).includes('.')
    ? String(value).indexOf('.')
    : String(value).length

  const printedValue = fixedLength(value, LENGTH + numberInts, LENGTH + padding)
  return `${name} ${printedValue}`
}

const LENGTH = 5

const fixedLength = function(number, length, lengthA) {
  const numberStr = String(number)
  return numberStr.slice(0, length).padStart(lengthA)
}
