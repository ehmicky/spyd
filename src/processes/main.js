import { forwardChildError } from './error.js'
import { getIpcFile, getIpcReturn } from './ipc.js'
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
  const { message, failed, timedOut, ipcReturn } = await spawnFile({
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
    ipcReturn,
    taskId,
    inputId,
  })

  return ipcReturn
}

const spawnFile = async function ({
  commandSpawn,
  commandSpawnOptions,
  eventPayload,
  timeoutNs,
  cwd,
  type,
}) {
  const { ipcFile, removeIpcFile } = await getIpcFile()

  try {
    const { message, failed, timedOut } = await spawnChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload: { ...eventPayload, ipcFile },
      timeoutNs,
      cwd,
      type,
    })
    const ipcReturn = await getIpcReturn({ ipcFile, failed })
    return { message, failed, timedOut, ipcReturn }
  } finally {
    await removeIpcFile()
  }
}
