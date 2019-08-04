// Standard deviation and variances have special handling:
//  - not shown unless option `verbose` true
//  - not shown if not enough samples
//  - prepended with ±
export const handleDeviation = function({ stat, statNumber, name, loops }) {
  if (!DEVIATION_STATS.includes(name)) {
    return stat
  }

  if (loops < MIN_LOOPS || statNumber === 0) {
    return ''
  }

  return `${PREFIX}${stat}`
}

const DEVIATION_STATS = ['deviation', 'variance']
const MIN_LOOPS = 10
const PREFIX = '±'
