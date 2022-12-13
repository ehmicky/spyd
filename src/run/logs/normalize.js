import stripFinalNewline from 'strip-final-newline'

import { findLastIndex } from '../../utils/find.js'

// Normalize task logs
export const normalizeLogs = (taskLogs, truncated) => {
  const taskLogsA = stripFinalNewline(taskLogs.trim())

  if (taskLogsA === '') {
    return taskLogsA
  }

  const taskLogsB = stripPartialLine(taskLogsA, truncated)
  const taskLogsC = removeDuplicateLines(taskLogsB)
  const taskLogsD = truncated ? `...\n${taskLogsC}` : taskLogsC
  return taskLogsD
}

// Remove the first line if it is incomplete.
// If there is only one line, do not do it.
const stripPartialLine = (taskLogs, truncated) => {
  if (!truncated) {
    return taskLogs
  }

  const newlineIndex = taskLogs.indexOf('\n')

  if (newlineIndex === -1) {
    return taskLogs
  }

  return taskLogs.slice(newlineIndex + 1)
}

// Only keep the lines starting from the first non-duplicate lines.
// Duplicate lines are very likely since the task is repeated.
const removeDuplicateLines = (taskLogs) => {
  const lines = taskLogs.split('\n')
  const duplicateIndex = findLastIndex(lines, isDuplicateLine)

  if (duplicateIndex === -1) {
    return taskLogs
  }

  return lines.slice(duplicateIndex).join('\n')
}

const isDuplicateLine = (line, index, lines) =>
  line.trim() !== '' &&
  lines.some((lineA, indexA) => indexA < index && lineA === line)
