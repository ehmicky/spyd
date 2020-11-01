import { forwardChildError } from './error.js'
import { addResultFile, getResult } from './result.js'
import { spawnChild } from './spawn.js'

// Execute a runner child process and retrieve its output.
// We are:
//  - passing JSON input with `argv`
//  - retrieving success JSON output with a specific file descriptor
//  - retrieving error string output with one or several file descriptors
// Which file descriptors are used depends on:
//  - whether `run` or `debug` is used
//  - whether this is the initial load
export const executeChild = async function ({
  commandSpawn,
  commandSpawnOptions,
  input,
  input: { taskPath },
  duration,
  cwd,
  taskId,
  variationId,
  type,
}) {
  const { message, failed, timedOut, result } = await spawnFile({
    commandSpawn,
    commandSpawnOptions,
    input,
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
  input,
  duration,
  cwd,
  type,
}) {
  const { input: inputA, removeResultFile } = await addResultFile(input)

  try {
    const { message, failed, timedOut } = await spawnChild({
      commandSpawn,
      commandSpawnOptions,
      input: inputA,
      duration,
      cwd,
      type,
    })
    const result = await getResult({ input: inputA, failed })
    return { message, failed, timedOut, result }
  } finally {
    await removeResultFile()
  }
}
