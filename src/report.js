export const report = function(benchmarks) {
  benchmarks.forEach(reportBenchmark)
}

const reportBenchmark = function({ task, parameter, stats }) {
  const parameterA = parameter === undefined ? '' : ` (${parameter})`
  const statsStr = serializeStats(stats)
  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(`${task}${parameterA} | ${statsStr}`)
}

export const serializeStats = function(stats) {
  return Object.entries(stats)
    .filter(shouldPrintStat)
    .map(serializeStat)
    .join(' | ')
}

const shouldPrintStat = function([name]) {
  return !NON_PRINTED_STATS.includes(name)
}

const NON_PRINTED_STATS = ['percentiles', 'histogram']

const serializeStat = function([name, number]) {
  const string = serializeNumber(number)
  const stringA = string.padStart(LENGTH)
  return `${name} ${stringA}`
}

const serializeNumber = function(number) {
  if (Number.isInteger(number)) {
    return String(number)
  }

  return number.toFixed(DECIMALS)
}

const DECIMALS = 4
const LENGTH = 7
