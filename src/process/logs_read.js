import { Buffer } from 'buffer'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open } from 'fs/promises'

// Read the last lines from the logs file
export const readLogs = async function (logsPath) {
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
