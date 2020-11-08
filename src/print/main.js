import { joinSystems } from '../system/join.js'

import { addCollections } from './collections.js'
import { addNames } from './name.js'
import { addSpeedInfo } from './speed.js'
import { normalizeStats } from './stats/main.js'

// We try to save as little as possible in stores, and compute anything that
// can on the fly, before reporting.
export const addPrintedInfo = function ({
  iterations,
  systems,
  git,
  ci,
  timestamp,
  ...benchmark
}) {
  const {
    iterations: iterationsA,
    tasks,
    inputs,
    commands,
    systems: systemColls,
  } = addCollections(iterations)
  const systemsA = joinSystems(systems, systemColls)

  const iterationsB = addNames(iterationsA)

  const iterationsC = addSpeedInfo(iterationsB)
  const iterationsD = normalizeStats(iterationsC)

  return {
    ...benchmark,
    timestamp,
    tasks,
    inputs,
    commands,
    systems: systemsA,
    git,
    ci,
    iterations: iterationsD,
  }
}
