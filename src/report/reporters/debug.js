// Debugging reporter only meant for development purpose
export const debug = function(
  { iterations, system },
  { link, system: showSystem },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const contentA = addSystem(content, system, showSystem)
  const contentB = addLink(contentA, link)
  return contentB
}

const serializeIteration = function({ name, printedStats, fastest }) {
  const fastestMark = fastest ? '*' : ' '
  const statsStr = serializeStats(printedStats)
  return `${fastestMark} ${name} | ${statsStr}`
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

const addSystem = function(content, system, showSystem) {
  if (!showSystem) {
    return content
  }

  const padding = getSystemPadding(system)
  const systemA = Object.entries(system)
    .map(([name, value]) => serializeSystemValue(name, value, padding))
    .join('\n')
  return `${content}\n\nSystem:\n${systemA}`
}

const getSystemPadding = function(system) {
  const lengths = Object.keys(system).map(getLength)
  return Math.max(...lengths)
}

const getLength = function(key) {
  return key.length
}

const serializeSystemValue = function(name, value, padding) {
  const nameA = `${name}:`.padEnd(padding + 1)
  return `  ${nameA} ${value}`
}

const addLink = function(content, link) {
  if (!link) {
    return content
  }

  return `${content}\n\nBenchmarked with spyd (https://github.com/ehmicky/spyd)`
}
