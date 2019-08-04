// Standard deviation and variances have special handling:
//  - not shown unless option `verbose` true
//  - not shown if not enough samples
//  - prepended with ±
export const handleDeviation = function({
  stat,
  statNumber,
  name,
  loops,
  verbose,
}) {
  if (!DEVIATION_STATS.includes(name)) {
    return stat
  }

  if (shouldSkip({ statNumber, loops, verbose })) {
    return ''
  }

  return `${PREFIX}${stat}`
}

const shouldSkip = function({ statNumber, loops, verbose }) {
  return statNumber === 0 || loops < MIN_LOOPS || !verbose
}

const DEVIATION_STATS = ['deviation', 'variance']
const MIN_LOOPS = 10
const PREFIX = '±'
