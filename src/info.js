import uuidv4 from 'uuid/v4.js'

import { DATA_VERSION } from './store/migrate/main.js'
import { getSystems } from './system/info.js'
import { getCiInfo } from './ci/info.js'
import { cleanObject } from './utils/clean.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(
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
