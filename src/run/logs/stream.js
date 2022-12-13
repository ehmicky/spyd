import { createWriteStream } from 'node:fs'
import { promisify } from 'node:util'

// Start file stream for the runner process to write to
export const startLogsStream = (logsFd) =>
  createWriteStream(undefined, { fd: logsFd })

// Ensure the stream buffer is flushed, i.e. we do not miss the last characters
export const stopLogsStream = async (logsStream) => {
  if (!logsStream.writable) {
    return
  }

  await promisify(logsStream.end.bind(logsStream))()
}

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
export const truncateLogs = async (logsFd) => {
  if (logsFd === undefined) {
    return
  }

  await logsFd.truncate(0)
}
