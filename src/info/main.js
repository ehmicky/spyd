import uuidv4 from 'uuid/v4.js'

import { getOpts } from './options.js'
import { addGroups } from './group.js'
import { getSystem } from './system.js'

// Add more information to the final benchmark and normalize/sort results
export const addBenchmarkInfo = function({ iterations, opts, versions }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()

  const optsA = getOpts(opts)

  const { tasks, variations, commands, iterations: iterationsA } = addGroups(
    iterations,
  )

  const system = getSystem(versions)

  return {
    id,
    timestamp,
    opts: optsA,
    tasks,
    variations,
    commands,
    system,
    iterations: iterationsA,
  }
}
