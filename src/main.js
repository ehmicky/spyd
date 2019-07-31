import pMapSeries from 'p-map-series'

import { getOpts } from './options/main.js'
import { getIterations } from './tasks/main.js'
import { runProcesses } from './processes/main.js'
import { report } from './report/main.js'

// Benchmark JavaScript code defined in a tasks file and report the results.
const spyd = async function(opts) {
  const optsA = await getOpts(opts)

  const iterations = await getIterations(optsA)

  const benchmarks = await pMapSeries(iterations, runProcesses)

  report(benchmarks)

  return benchmarks
}

// We do not use `export default` because Babel transpiles it in a way that
// requires CommonJS users to `require(...).default` instead of `require(...)`.
module.exports = spyd
