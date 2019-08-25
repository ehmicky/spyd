import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { getMachine } from './machine.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function(
  iterations,
  { opts, opts: { group, system }, versions },
) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const optsA = getOpts(opts)
  const machine = getMachine(versions)
  const systems = [{ id: system, title: system, opts: optsA, ...machine }]

  return { id, timestamp, group, systems, iterations }
}
