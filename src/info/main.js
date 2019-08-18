import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getMachine } from './machine.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(
  iterations,
  { opts, opts: { group, env }, versions },
) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const optsA = getOpts(opts)
  const system = getMachine(versions)
  const envs = [{ id: env, title: env, opts: optsA, system }]

  return { id, timestamp, group, envs, iterations }
}
