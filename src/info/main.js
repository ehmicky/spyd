import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(
  iterations,
  { opts, opts: { group, system } },
) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const systems = getSystems(opts, system)
  return { id, timestamp, group, systems, iterations }
}

const getSystems = function(opts, { id, title }) {
  const optsA = getOpts(opts)
  const system = getSystem()
  return [{ id, title, opts: optsA, ...system }]
}
