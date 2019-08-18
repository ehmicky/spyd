import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const optsA = getOpts(opts)

  const system = getSystem(versions)

  return { id, timestamp, opts: optsA, system, iterations }
}
