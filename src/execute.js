import { benchmark } from './temp.js'

const func = Math.random

const printStat = function(name, value, allStats) {
  const otherStats = allStats.map(stats => stats[name])
  const intDigits = otherStats.map(stat =>
    String(stat).includes('.') ? String(stat).indexOf('.') : 1,
  )
  const padding = Math.max(...intDigits)

  const numberInts = String(value).indexOf('.')

  const printedValue = fixedLength(value, LENGTH + numberInts, LENGTH + padding)
  return `${name} ${printedValue}`
}

const LENGTH = 5

const fixedLength = function(number, length, lengthA) {
  const numberStr = String(number)
  return numberStr.slice(0, length).padStart(lengthA)
}

console.log(
  Array.from({ length: 10 }, () => {
    return benchmark(func, 1e8)
  })
    .map((stats, index, allStats) => {
      return Object.entries(stats)
        .map(([name, value]) => printStat(name, value, allStats))
        .join(' | ')
    })
    .join('\n'),
)
