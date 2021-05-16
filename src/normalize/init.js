import { v4 as uuidv4 } from 'uuid'

import { getSystems } from '../system/info.js'
import { cleanObject } from '../utils/clean.js'

import { normalizeResult } from './result.js'

// Add metadata information to initial result
export const getInitResult = function ({
  combinations,
  combinations: [{ systemId }],
  systemVersions,
  config: { envInfo },
}) {
  const id = uuidv4()
  const timestamp = Date.now()
  const systems = getSystems({ systemId, systemVersions, envInfo })
  const initResult = cleanObject({ id, timestamp, systems })
  const initResultA = addFinalProps(initResult, combinations)
  return initResultA
}

// Finalize result. Done either at the end, or before each preview.
export const getFinalResult = function (initResult, combinations) {
  const rawResult = addFinalProps(initResult, combinations)
  const result = normalizeResult(rawResult)
  return { rawResult, result }
}

const addFinalProps = function (initResult, combinations) {
  const combinationsA = combinations.map(getFinalProps)
  return { ...initResult, combinations: combinationsA }
}

// Retrieve final combination properties used for reporting.
// `stats` is `undefined` during the first preview report.
const getFinalProps = function ({ taskId, runnerId, systemId, stats = {} }) {
  return { taskId, runnerId, systemId, stats }
}
