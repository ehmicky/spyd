import { v4 as uuidv4 } from 'uuid'

import { mergeResults } from '../normalize/merge.js'
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

// Finalize result. Done either at the end, or before each preview.
export const getFinalResult = function (combinations, initResult, results) {
  const combinationsA = combinations.map(getFinalProps)
  const rawResult = { ...initResult, combinations: combinationsA }
  const result = mergeResults(rawResult, results)
  return { rawResult, result }
}

// Retrieve final combination properties used for reporting.
// `stats` is `undefined` during the first preview report.
const getFinalProps = function ({ taskId, runnerId, systemId, stats = {} }) {
  return { taskId, runnerId, systemId, stats }
}
