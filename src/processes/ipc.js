import { readFile } from 'fs'
import { promisify } from 'util'

import { file as getTmpFile } from 'tmp-promise'

import { CoreError } from '../error/main.js'

const pReadFile = promisify(readFile)

// Create a JSON file for IPC.
// We use a single JSON file because parsing/serializing is not CPU intensive.
// Streaming results would provide with better progress reporting, but would
// be harder to implement for reporters and force them to stop measuring
// at regular intervals, which might increase variance.
export const addResultFile = async function (eventPayload) {
  const { path, cleanup } = await getTmpFile({ template: RESULT_FILENAME })
  return {
    eventPayload: { ...eventPayload, resultFile: path },
    removeResultFile: cleanup,
  }
}

const RESULT_FILENAME = 'spyd-XXXXXX.json'

// Retrieve child's IPC result.
export const getResult = async function ({
  eventPayload: { resultFile },
  failed,
}) {
  try {
    const rawResult = await pReadFile(resultFile, 'utf8')
    const result = JSON.parse(rawResult)
    return result
  } catch (error) {
    return handleResultError(error, failed)
  }
}

// Process might fail before writing error result
const handleResultError = function (error, failed) {
  if (failed) {
    return
  }

  throw new CoreError(`Could not read runner measures: ${error.stack}`)
}
