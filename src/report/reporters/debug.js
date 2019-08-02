// Debugging reporter only meant for development purpose
export const debug = function({ iterations }) {
  return iterations.map(serializeIteration).join('\n')
}

const serializeIteration = function({ name, printedStats }) {
  const statsStr = serializeStats(printedStats)
  return `${name} | ${statsStr}`
}

export const serializeStats = function(printedStats) {
  return Object.entries(printedStats)
    .filter(shouldPrintStat)
    .map(serializeStat)
    .join(' | ')
}

const shouldPrintStat = function([name]) {
  return !NON_PRINTED_STATS.includes(name)
}

const NON_PRINTED_STATS = ['percentiles', 'histogram']

const serializeStat = function([name, string]) {
  return `${name} ${string}`
}
