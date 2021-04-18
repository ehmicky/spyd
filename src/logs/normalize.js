import stripFinalNewline from 'strip-final-newline'

// Normalize task logs
export const normalizeLogs = function (taskLogs, truncated) {
  const taskLogsA = stripFinalNewline(taskLogs.trim())

  if (taskLogsA === '') {
    return taskLogsA
  }

  const taskLogsB = stripPartialLine(taskLogsA)
  const taskLogsC = truncated ? `...\n${taskLogsB}` : taskLogsB
  return taskLogsC
}

// Remove the first line if it is incomplete.
// If there is only one line, do not do it.
const stripPartialLine = function (taskLogs) {
  const newlineIndex = taskLogs.indexOf('\n')
  return newlineIndex === -1 ? taskLogs : taskLogs.slice(newlineIndex + 1)
}
