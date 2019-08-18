import uuidv4 from 'uuid/v4.js'

import { getOptions } from './options.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({
  iterations,
  opts,
  opts: { job },
  versions,
}) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const envs = getEnvs({ opts, versions })

  return { id, timestamp, job, envs, iterations }
}

// Retrieve current `benchmark.envs` (options + system)
export const getEnvs = function({ opts, opts: { env }, versions }) {
  const options = getOptions(opts)
  const system = getSystem(versions)
  return [{ id: env, title: env, options, system }]
}
