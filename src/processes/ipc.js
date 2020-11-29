import { readFile } from 'fs'
import { promisify } from 'util'

import { file as getTmpFile } from 'tmp-promise'

import { CoreError } from '../error/main.js'

const pReadFile = promisify(readFile)

// Create a JSON file for IPC.
// We use a single JSON file because parsing/serializing is not CPU intensive.
// It is actually faster than using a plain newline-separated list because JSON
// parsing/serializing is optimized in V8.
// Streaming measures would create CPU and I/O work in the runner which would
// compete with measuring. Therefore it should not be done as it would impact
// both accuracy and precision.
export const getIpcFile = async function () {
  const { path, cleanup } = await getTmpFile({ template: IPC_FILENAME })
  return { ipcFile: path, removeIpcFile: cleanup }
}

const IPC_FILENAME = 'spyd-measures-XXXXXX.json'

// Retrieve processMeasures.
// We could probably use a named pipe instead of a regular file. However, this
// does not seem to provide a significant performance improvement at the
// moment.
export const getIpcReturn = async function ({ ipcFile, failed }) {
  try {
    const ipcReturnStr = await pReadFile(ipcFile, 'utf8')
    const ipcReturn = JSON.parse(ipcReturnStr)
    return ipcReturn
  } catch (error) {
    return handleIpcError(error, failed)
  }
}

// Process might fail before writing error message
const handleIpcError = function (error, failed) {
  if (failed) {
    return
  }

  throw new CoreError(`Could not read runner measures: ${error.stack}`)
}
