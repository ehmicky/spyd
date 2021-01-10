import { v4 as uuidv4 } from 'uuid'

import { getSystem } from './system/info.js'
import { cleanObject } from './utils/clean.js'

// Add more information to the final result and normalize/sort it
export const addResultInfo = function ({ combinations, config }) {
  const id = uuidv4()
  const timestamp = new Date().toISOString()
  const system = getSystem({ combinations, config })
  const result = { id, timestamp, system, combinations }
  const resultA = cleanObject(result)
  return resultA
}
