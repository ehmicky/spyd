import { v4 as uuidv4 } from 'uuid'

import { getCiInfo } from './ci/info.js'
import { getSystems } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Add more information to the final partialResult and normalize/sort it
export const addResultInfo = function (
  combinations,
  { config: { system, cwd } },
) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const { git, ci, job } = getCiInfo(cwd)
  const systems = getSystems({ system, job })
  const partialResult = {
    id,
    timestamp,
    systems,
    git,
    ci,
    combinations,
  }

  const partialResultA = cleanObject(partialResult)
  return partialResultA
}
