import { Buffer } from 'buffer'
// eslint-disable-next-line node/no-missing-import, import/no-unresolved
import { open } from 'fs/promises'

import stripFinalNewline from 'strip-final-newline'

// To minimize the size on disk:
//  - We use a temporary file
//  - We truncate that file periodically
// We do it:
//  - After each sample, since each task's logs should be independent
//  - Not after start|before, since we want to print their logs if the first
//    measuring loop fails
//  - Not during `minLoopDuration` estimation since it does not execute the task
//    and the runner is unlikely to create too much output
// We do not check the size before doing it (as a performance optimization)
// since:
//  - When logs are low, `stat()` is roughly as slow as `truncate()`
//  - When logs are high, we most likely want to truncate
//  - This function is performed in parallel to preview reporting, which
//    minimizes its performance cost
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

  if (taskLogs === '') {
    return
  }

  const additionalMessage = getAdditionalMessage(taskLogs)
  error.message = `${error.message}
${additionalMessage}
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
  const lastLogsA = stripFinalNewline(lastLogs.trim())

  if (lastLogsA === '') {
    return lastLogsA
  }

  const lastLogsB = stripPartialLine(lastLogsA)
  const lastLogsC = truncated ? `...\n${lastLogsB}` : lastLogsB
  return lastLogsC
}

// Remove the first line if it is incomplete.
// If there is only one line, do not do it.
const stripPartialLine = function (lastLogs) {
  const newlineIndex = lastLogs.indexOf('\n')
  return newlineIndex === -1 ? lastLogs : lastLogs.slice(newlineIndex + 1)
}

// Adds an additional error message based on some common errors that can be
// detected from the tasks logs.
// Some might be language-specific. We detect those in core instead of inside
// each runner because some runners:
//  - Might share the same language, e.g. several runners might use
//    JavaScript
//  - Call another language, e.g. the `cli` runner might call `node`
const getAdditionalMessage = function (taskLogs) {
  const additionalMessage = ADDITIONAL_MESSAGES.find(({ includes }) =>
    taskLogs.includes(includes),
  )

  if (additionalMessage === undefined) {
    return ''
  }

  return `${additionalMessage.message}\n`
}

const ADDITIONAL_MESSAGES = [
  {
    includes: 'JavaScript heap out of memory',
    message:
      'The task ran out of memory. This is most likely due to a memory leak in the task.',
  },
]
