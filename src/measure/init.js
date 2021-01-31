import { v4 as uuidv4 } from 'uuid'

import { getSystems } from '../system/info.js'
import { cleanObject } from '../utils/clean.js'

// Add metadata information to initial result
export const getInitResult = function ({
  combinations: [{ systemId }],
  systemVersions,
  config: { envInfo },
}) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  const initResult = cleanObject({ id, timestamp, systems })
  return initResult
}
