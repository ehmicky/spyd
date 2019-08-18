import uuidv4 from 'uuid/v4.js'

import { getOptions } from './options.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const env = getEnv({ opts })

  const system = getSystem(versions)

  return { id, timestamp, env, system, iterations }
}

// Retrieve current `benchmark.env` (options + system)
export const getEnv = function({ opts, opts: { env } }) {
  const options = getOptions(opts)
  return { id: env, title: env, options }
}
