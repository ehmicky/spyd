import pMapSeries from 'p-map-series'

import { getOpts } from './options.js'
import { getIterations } from './tasks.js'
import { start } from './runner.js'
import { report } from './report.js'

const checkSpeed = async function(opts) {
  const optsA = await getOpts(opts)

  const iterations = await getIterations(optsA)

  // Run each parameter serially to avoid one parameter influencing the timing
  // of another
  const benchmarks = await pMapSeries(iterations, start)

  report(benchmarks)

  return benchmarks
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
