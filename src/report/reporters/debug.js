// Debugging reporter only meant for development purpose
export const debug = function(benchmarks) {
  return benchmarks.map(serializeBenchmark).join('\n')
}

const serializeBenchmark = function({ task, parameter, stats }) {
  const parameterA = parameter === undefined ? '' : ` (${parameter})`
  const title = `${task}${parameterA}`.padEnd(TITLE_PADDING)
  const statsStr = serializeStats(stats)
  return `${title} | ${statsStr}`
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
  const stringA = string.padStart(LENGTH + EXPONENTS_SIZE)
  return `${name} ${stringA}`
}

const serializeNumber = function(number) {
  if (number > MIN_EXPONENTIAL) {
    return number.toExponential(DECIMALS)
  }

  if (!Number.isInteger(number)) {
    return number.toFixed(DECIMALS)
  }

  return String(number)
}

const TITLE_PADDING = 13
const DECIMALS = 3
const LENGTH = 4
// eslint-disable-next-line no-magic-numbers
const MIN_EXPONENTIAL = 10 ** LENGTH
const EXPONENTS_SIZE = 4
