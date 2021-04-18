import { createWriteStream, constants } from 'fs'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open, unlink, mkdir } from 'fs/promises'
import { dirname } from 'path'

import { tmpName } from 'tmp-promise'

// Use a temporary file to log all of the runner's stdout and stderr.
// This is unique for each combination.
export const startLogs = async function (stage) {
  if (!hasLogs(stage)) {
    return {}
  }

  const logsPath = await getLogsPath()
  const logsFd = await open(logsPath, LOGS_FILE_FLAGS)
  const logsStream = createWriteStream(undefined, { fd: logsFd })
  return { logsPath, logsFd, logsStream }
}

// The `exec` command prints stdout/stderr. stdin is always ignored.
// Anything printed during process spawning (e.g. top-level scope in Node.js)
// might be repeated for each combination. This is good since:
//  - It makes it clear that each combination has its own process
//  - Some stdout/stderr might differ from process to process
const hasLogs = function (stage) {
  return stage !== 'exec'
}

const getLogsPath = async function () {
  const logsPath = await tmpName({ dir: LOGS_DIR })
  await mkdir(dirname(logsPath), { recursive: true })
  return logsPath
}

const LOGS_DIR = 'spyd/logs/'
// TODO: check all possible flag, especially O_DIRECT, O_SYNC, O_DSYNC
//       If none are used, use 'a+' instead of individual flags.
const LOGS_FILE_FLAGS =
  // eslint-disable-next-line no-bitwise
  constants.O_APPEND | constants.O_CREAT | constants.O_RDWR | constants.O_EXCL

// Delete logs file after each combination
export const stopLogs = async function (logsPath, logsFd) {
  if (logsFd === undefined) {
    return
  }

  try {
    await logsFd.close()
  } finally {
    await unlink(logsPath)
  }
}
