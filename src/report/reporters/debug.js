import { cyan, blue, yellow, dim, underline } from 'chalk'

// Debugging reporter only meant for development purpose
const report = function(
  { timestamp, iterations, systemPretty },
  { link, system, show },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const contentA = addSystem({ content, system, systemPretty })
  const contentB = addTimestamp({ content: contentA, timestamp, show })
  const contentC = addLink({ content: contentB, link })
  return `\n${contentC}\n\n`
}

const serializeIteration = function({ name, stats, fastest }) {
  const fastestMark = fastest ? cyan.bold('*') : ' '
  const statsStr = serializeStats(stats)
  return ` ${fastestMark} ${name}  ${cyan.dim('|')}  ${statsStr}`
}

export const serializeStats = function(stats) {
  return STATS.map(statName => serializeStat(stats, statName)).join(dim(' | '))
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
  return `${statName} ${yellow(stat)}`
}

const addSystem = function({ content, system, systemPretty }) {
  if (!system) {
    return content
  }

  return `${content}\n\n${systemPretty}`
}

const addLink = function({ content, link }) {
  if (!link) {
    return content
  }

  return `${content}\n\n${dim(
    ` Benchmarked with spyd ${underline('(https://github.com/ehmicky/spyd)')}`,
  )}`
}

const addTimestamp = function({ content, timestamp, show }) {
  if (!show) {
    return content
  }

  return `${content}\n\n${blue.bold('Timestamp:')} ${timestamp}`
}

export const debug = { report }
