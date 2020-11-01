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
  duration,
  cwd,
  taskId,
  variationId,
  type,
}) {
  const { message, failed, timedOut, result } = await spawnFile({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    duration,
    cwd,
    type,
  })

  forwardChildError({
    message,
    failed,
    timedOut,
    duration,
    taskPath,
    result,
    taskId,
    variationId,
  })

  return result
}

const spawnFile = async function ({
  commandSpawn,
  commandSpawnOptions,
  eventPayload,
  duration,
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
      duration,
      cwd,
      type,
    })
    const result = await getResult({ eventPayload: eventPayloadA, failed })
    return { message, failed, timedOut, result }
  } finally {
    await removeResultFile()
  }
}
