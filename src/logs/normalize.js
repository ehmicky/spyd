import stripFinalNewline from 'strip-final-newline'

// Normalize task logs
export const normalizeLogs = function (lastLogs, truncated) {
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
