import { cyan, yellow, dim } from 'chalk'

import { getFooter } from './footer.js'

// Debugging reporter only meant for development purpose
const report = function(
  { timestampPretty, job, systemPretty, iterations },
  { system, show, link },
) {
  const content = iterations.map(serializeIteration).join('\n')
  const footer = getFooter({
    timestampPretty,
    job,
    systemPretty,
    system,
    show,
    link,
  })
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

export const debug = { report }
