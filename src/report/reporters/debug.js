import { cyan, blue, yellow, dim, underline } from 'chalk'
import indentString from 'indent-string'

// Debugging reporter only meant for development purpose
const report = function(
  { timestamp, iterations, systemPretty },
  { system, show, link },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const footer = getFooter({ systemPretty, timestamp, system, show, link })
  return `\n${content}${footer}\n\n`
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

const getFooter = function({ systemPretty, timestamp, system, show, link }) {
  const systemFooter = getSystem(systemPretty, system)
  const timestampFooter = getTimestamp(timestamp, show)
  const linkFooter = getLink(link)
  const footers = [systemFooter, timestampFooter, linkFooter].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const getSystem = function(systemPretty, system) {
  if (!system) {
    return
  }

  return systemPretty
}

const getTimestamp = function(timestamp, show) {
  if (!show) {
    return
  }

  return `${blue.bold('Timestamp:')} ${timestamp}`
}

const getLink = function(link) {
  if (!link) {
    return
  }

  return dim(
    `Benchmarked with spyd ${underline('(https://github.com/ehmicky/spyd)')}`,
  )
}

const indentFooter = function(footer) {
  return indentString(footer, 1)
}

export const debug = { report }
