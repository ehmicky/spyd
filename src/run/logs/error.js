import { Buffer } from 'node:buffer'
import { open } from 'node:fs/promises'

import { BaseError, StopError } from '../../error/main.js'

import { getAdditionalMessage } from './additional.js'
import { normalizeLogs } from './normalize.js'

// When an exception is thrown, add the runner's last log lines to the error
// message.
export const addErrorTaskLogs = async (error, logsPath) => {
  if (error instanceof StopError) {
    return error
  }

  const { taskLogs, truncated } = await readLogs(logsPath)
  const taskLogsA = normalizeLogs(taskLogs, truncated)

  if (taskLogsA === '') {
    return error
  }

  const additionalMessage = getAdditionalMessage(taskLogsA)
  return new BaseError(`${additionalMessage}Task logs:\n${taskLogsA}`, {
    cause: error,
  })
}

// Read the last lines from the logs file
const readLogs = async (logsPath) => {
  const logsReadFd = await open(logsPath, 'r')

  try {
    const { size } = await logsReadFd.stat()
    const buffer = Buffer.alloc(ERROR_LOGS_LENGTH)
    const position = Math.max(size - ERROR_LOGS_LENGTH, 0)
    const truncated = size > ERROR_LOGS_LENGTH
    const { bytesRead } = await logsReadFd.read({ buffer, position })
    const taskLogs = buffer.slice(0, bytesRead).toString()
    return { taskLogs, truncated }
  } finally {
    await logsReadFd.close()
  }
}

// Maximum number of bytes to read and print
const ERROR_LOGS_LENGTH = 1e4
