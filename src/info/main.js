import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const envs = getEnvs({ opts })

  const system = getSystem(versions)

  return { id, timestamp, envs, system, iterations }
}

// Retrieve current `env` (options + system) and set it to `benchmark.envs`
export const getEnvs = function({ opts, opts: { env } }) {
  const optsA = getOpts(opts)
  return [{ id: env, title: env, opts: optsA }]
}
