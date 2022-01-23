import { Buffer } from 'buffer'
import { promises as fs } from 'fs'

import { wrapError } from '../../error/wrap.js'

import { getAdditionalMessage } from './additional.js'
import { normalizeLogs } from './normalize.js'

// When an exception is thrown, add the runner's last log lines to the error
// message.
export const addErrorTaskLogs = async function (error, logsPath) {
  if (error.name === 'StopError') {
    return error
  }

  const { taskLogs, truncated } = await readLogs(logsPath)
  const taskLogsA = normalizeLogs(taskLogs, truncated)

  if (taskLogsA === '') {
    return error
  }

  const additionalMessage = getAdditionalMessage(taskLogsA)
  return wrapError(error, `\n${additionalMessage}\nTask logs:\n${taskLogsA}`)
}

// Read the last lines from the logs file
const readLogs = async function (logsPath) {
  const logsReadFd = await fs.open(logsPath, 'r')

  try {
    const { size } = await logsReadFd.stat()
    const buffer = Buffer.alloc(ERROR_LOGS_LENGTH)
    const position = size - ERROR_LOGS_LENGTH
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
