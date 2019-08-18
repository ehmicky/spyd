// Debugging reporter only meant for development purpose
const report = function(
  { timestamp, iterations, printedSystem },
  { link, system, show },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const contentA = addSystem(content, system, printedSystem)
  const contentB = addLink(contentA, link)
  const contentC = addTimestamp(contentB, timestamp, show)
  return contentC
}

const serializeIteration = function({ name, stats, fastest }) {
  const fastestMark = fastest ? '*' : ' '
  const statsStr = serializeStats(stats)
  return `${fastestMark} ${name} | ${statsStr}`
}

export const serializeStats = function(stats) {
  return STATS.map(statName => serializeStat(stats, statName)).join(' | ')
}

const STATS = [
  'median',
  'mean',
  'min',
  'max',
  'diff',
  'deviation',
  'variance',
  'count',
  'loops',
  'repeat',
  'processes',
]

const serializeStat = function(stats, statName) {
  const stat = stats[`${statName}Pretty`]
  return `${statName} ${stat}`
}

const addSystem = function(content, system, printedSystem) {
  if (!system) {
    return content
  }

  return `${content}\n\n${printedSystem}`
}

const addLink = function(content, link) {
  if (!link) {
    return content
  }

  return `${content}\n\nBenchmarked with spyd (https://github.com/ehmicky/spyd)`
}

const addTimestamp = function(content, timestamp, show) {
  if (!show) {
    return content
  }

  return `${content}\n\nTimestamp: ${timestamp}`
}

export const debug = { report }
