import { Buffer } from 'buffer'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open } from 'fs/promises'

// To minimize the size on disk:
//  - We use a temporary file
//  - We truncate that file periodically
// We do it:
//  - After each sample, since each task's logs should be independent
//  - Not after start|before, since we want to print their logs if the first
//    measuring loop fails
//  - Not during `minLoopDuration` estimation since it does not execute the task
//    and the runner is unlikely to create too much output
export const truncateLogs = async function (logsFd) {
  await logsFd.truncate(0)
}

// When an exception is thrown, add the runner's last log lines to the error
// message.
export const addTaskLogs = async function (logsPath, error) {
  if (error.name === 'StopError') {
    return
  }

  const taskLogs = await readLogs(logsPath)

  if (taskLogs === undefined) {
    return
  }

  error.message = `${error.message}

Task logs:
${taskLogs}`
}

// Read the last lines from the logs file
const readLogs = async function (logsPath) {
  const logsReadFd = await open(logsPath, 'r')

  try {
    const { size } = await logsReadFd.stat()
    const buffer = Buffer.alloc(ERROR_LOGS_LENGTH)
    const position = size - ERROR_LOGS_LENGTH
    const truncated = size > ERROR_LOGS_LENGTH
    const { bytesRead } = await logsReadFd.read({ buffer, position })
    const lastLogs = buffer.slice(0, bytesRead).toString()
    return normalizeLogs(lastLogs, truncated)
  } finally {
    await logsReadFd.close()
  }
}

// Maximum number of bytes to read and print
const ERROR_LOGS_LENGTH = 1e4

const normalizeLogs = function (lastLogs, truncated) {
  const lastLogsA = lastLogs.trim()

  if (lastLogsA === '') {
    return
  }

  const lastLogsB = truncated ? `...${lastLogsA}` : lastLogsA
  return lastLogsB
}
