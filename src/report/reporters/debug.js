// Debugging reporter only meant for development purpose
const report = function(
  { timestamp, iterations, systemPretty },
  { link, system, show, chalk },
) {
  const content = iterations
    .map(iteration => serializeIteration({ iteration, chalk }))
    .join('\n')
  const contentA = addSystem({ content, system, systemPretty })
  const contentB = addTimestamp({ content: contentA, timestamp, show, chalk })
  const contentC = addLink({ content: contentB, link, chalk })
  return contentC
}

const serializeIteration = function({
  iteration: { name, stats, fastest },
  chalk,
  chalk: { cyan },
}) {
  const fastestMark = fastest ? cyan.bold('*') : ' '
  const statsStr = serializeStats({ stats, chalk })
  return ` ${fastestMark} ${name}  ${cyan.dim('|')}  ${statsStr}`
}

export const serializeStats = function({ stats, chalk, chalk: { dim } }) {
  return STATS.map(statName => serializeStat(stats, statName, chalk)).join(
    dim(' | '),
  )
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

const serializeStat = function(stats, statName, { yellow }) {
  const stat = stats[`${statName}Pretty`]
  return `${statName} ${yellow(stat)}`
}

const addSystem = function({ content, system, systemPretty }) {
  if (!system) {
    return content
  }

  return `${content}\n\n${systemPretty}`
}

const addLink = function({ content, link, chalk: { dim, underline } }) {
  if (!link) {
    return content
  }

  return `${content}\n\n${dim(
    `Benchmarked with spyd ${underline('(https://github.com/ehmicky/spyd)')}`,
  )}`
}

const addTimestamp = function({ content, timestamp, show, chalk: { blue } }) {
  if (!show) {
    return content
  }

  return `${content}\n\n${blue.bold('Timestamp:')} ${timestamp}`
}

export const debug = { report }
