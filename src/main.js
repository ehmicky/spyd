import pMapSeries from 'p-map-series'

import { getOpts } from './options/main.js'
import { getIterations } from './tasks/main.js'
import { runProcesses } from './processes/main.js'
import { report } from './report/main.js'

const checkSpeed = async function(opts) {
  const optsA = await getOpts(opts)

  const iterations = await getIterations(optsA)

  const benchmarks = await pMapSeries(iterations, runProcesses)

  report(benchmarks)

  return benchmarks
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = checkSpeed
