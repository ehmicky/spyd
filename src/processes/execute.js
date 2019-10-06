import execa from 'execa'

import { FDS } from './fd.js'
import { getTimeout } from './timeout.js'
import { getOutput, getErrorOutput } from './output.js'
import { forwardChildError } from './error.js'

// Execute a runner child process and retrieve its output.
// We are:
//  - passing JSON input with `argv`
//  - retrieving success JSON output with a specific file descriptor
//  - retrieving error string output with one or several file descriptors
// Which file descriptors are used depends on:
//  - whether `run` or `debug` is used
//  - whether this is the initial load
export const executeChild = async function({
  commandValue: [file, ...args],
  input,
  input: { taskPath },
  duration,
  cwd,
  taskId,
  variationId,
  type,
}) {
  const inputA = JSON.stringify(input)

  const { stdio, outputFd, errorFds } = FDS[type]

  const spawnOptions = getSpawnOptions({ stdio, cwd, duration })
  const child = execa(file, [...args, inputA], spawnOptions)

  // Wait for child process successful exit, failed exit, spawning error,
  // stream error or timeout
  const [
    { message, failed, timedOut },
    output,
    errorOutput,
  ] = await Promise.all([
    child,
    getOutput(child, outputFd),
    getErrorOutput(child, errorFds),
  ])

  forwardChildError({
    message,
    failed,
    timedOut,
    duration,
    taskPath,
    errorOutput,
    taskId,
    variationId,
  })

  if (output === undefined) {
    return
  }

  const outputA = JSON.parse(output)
  return outputA
}

const getSpawnOptions = function({ stdio, cwd, duration }) {
  const timeout = getTimeout(duration)
  return { stdio, cwd, timeout, buffer: false, reject: false }
}
