import { forwardChildError } from './error.js'
import { addResultFile, getResult } from './ipc.js'
import { spawnChild } from './spawn.js'

// Execute a runner child process and retrieve its output.
// We are:
//  - passing JSON event payload with `argv`
//  - retrieving success JSON output with a specific file descriptor
//  - retrieving error string output with one or several file descriptors
// Which file descriptors are used depends on:
//  - whether `run` or `debug` is used
//  - whether this is the initial load
export const executeChild = async function ({
  commandSpawn,
  commandSpawnOptions,
  eventPayload,
  eventPayload: { taskPath },
  timeoutNs,
  cwd,
  taskId,
  inputId,
  type,
}) {
  const { message, failed, timedOut, result } = await spawnFile({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    timeoutNs,
    cwd,
    type,
  })

  forwardChildError({
    message,
    failed,
    timedOut,
    timeoutNs,
    taskPath,
    result,
    taskId,
    inputId,
  })

  return result
}

const spawnFile = async function ({
  commandSpawn,
  commandSpawnOptions,
  eventPayload,
  timeoutNs,
  cwd,
  type,
}) {
  const { eventPayload: eventPayloadA, removeResultFile } = await addResultFile(
    eventPayload,
  )

  try {
    const { message, failed, timedOut } = await spawnChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: eventPayloadA,
      timeoutNs,
      cwd,
      type,
    })
    const result = await getResult({ eventPayload: eventPayloadA, failed })
    return { message, failed, timedOut, result }
  } finally {
    await removeResultFile()
  }
}
