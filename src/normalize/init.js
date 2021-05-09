import { v4 as uuidv4 } from 'uuid'

import { getSystems } from '../system/info.js'
import { cleanObject } from '../utils/clean.js'

import { mergeResults } from './merge.js'
import { addHistory } from './since.js'

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
export const getFinalResult = function ({
  combinations,
  initResult,
  previous,
  history,
}) {
  const combinationsA = combinations.map(getFinalProps)
  const rawResult = { ...initResult, combinations: combinationsA }
  const rawResultA = addHistory(rawResult, history)
  const result = mergeResults(rawResultA, previous)
  // TODO: what's `rawResult` used for?
  return { rawResult: rawResultA, result }
}

// Retrieve final combination properties used for reporting.
// `stats` is `undefined` during the first preview report.
const getFinalProps = function ({ taskId, runnerId, systemId, stats = {} }) {
  return { taskId, runnerId, systemId, stats }
}
