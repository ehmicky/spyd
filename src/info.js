import { v4 as uuidv4 } from 'uuid'

import { getCiInfo } from './ci/info.js'
import { getSystems } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function (
  combinations,
  { opts, opts: { system, cwd } },
) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const { git, ci, job } = getCiInfo(cwd)
  const systems = getSystems({ opts, system, job })
  const rawBenchmark = {
    id,
    timestamp,
    systems,
    git,
    ci,
    combinations,
  }

  const rawBenchmarkA = cleanObject(rawBenchmark)
  return rawBenchmarkA
}
