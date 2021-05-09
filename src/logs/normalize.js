import stripFinalNewline from 'strip-final-newline'

import { findIndexReverse } from '../utils/find.js'

// Normalize task logs
export const normalizeLogs = function (taskLogs, truncated) {
  const taskLogsA = stripFinalNewline(taskLogs.trim())

  if (taskLogsA === '') {
    return taskLogsA
  }

  const taskLogsB = stripPartialLine(taskLogsA)
  const taskLogsC = removeDuplicateLines(taskLogsB)
  const taskLogsD = truncated ? `...\n${taskLogsC}` : taskLogsC
  return taskLogsD
}

// Remove the first line if it is incomplete.
// If there is only one line, do not do it.
const stripPartialLine = function (taskLogs) {
  const newlineIndex = taskLogs.indexOf('\n')
  return newlineIndex === -1 ? taskLogs : taskLogs.slice(newlineIndex + 1)
}

// Only keep the lines starting from the first non-duplicate lines.
// Duplicate lines are very likely since the task is repeated.
const removeDuplicateLines = function (taskLogs) {
  const lines = taskLogs.split('\n')
  const duplicateIndex = findIndexReverse(lines, isDuplicateLine)

  if (duplicateIndex === -1) {
    return taskLogs
  }

  return lines.slice(duplicateIndex).join('\n')
}

const isDuplicateLine = function (line, index, lines) {
  return lines.some((lineA, indexA) => indexA < index && lineA === line)
}
