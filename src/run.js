import pMapSeries from 'p-map-series'
import pFinally from 'p-finally'
import uuidv4 from 'uuid/v4.js'

import { startProgress } from './progress/start.js'
import { stopProgress } from './progress/stop.js'
import { getIterations } from './iterations/main.js'
import { runProcesses } from './processes/main.js'
import { DATA_VERSION } from './store/migrate/main.js'
import { getSystems } from './system/info.js'
import { getCiInfo } from './ci/info.js'
// eslint-disable-next-line import/max-dependencies
import { cleanObject } from './utils/clean.js'

// Run a new benchmark
export const runBenchmark = async function(opts) {
  const { iterations, versions } = await getIterations(opts)

  const { progressState, progressInfo } = await startProgress(iterations, opts)

  // TODO: replace with `try {} finally {}` when dropping support for Node 8/9
  const rawBenchmark = await pFinally(
    computeBenchmark({ iterations, progressState, opts, versions }),
    () => stopProgress(progressInfo),
  )
  return rawBenchmark
}

const computeBenchmark = async function({
  iterations,
  progressState,
  opts,
  versions,
}) {
  const iterationsA = await pMapSeries(iterations, (iteration, index) =>
    runProcesses({ ...iteration, index, progressState, opts }),
  )
  const rawBenchmark = addBenchmarkInfo(iterationsA, { opts, versions })
  return rawBenchmark
}

// Add more information to the final benchmark and normalize/sort results
const addBenchmarkInfo = function(
  iterations,
  { opts, opts: { group, system, cwd } },
) {
  const version = DATA_VERSION
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const { git, ci, job } = getCiInfo(cwd)
  const systems = getSystems({ opts, system, job })
  const rawBenchmark = {
    version,
    id,
    timestamp,
    group,
    systems,
    git,
    ci,
    iterations,
  }
  const rawBenchmarkA = cleanObject(rawBenchmark)
  return rawBenchmarkA
}
