import execa from 'execa'

import { forwardChildError } from './error.js'
import { getOutput, getErrorOutput } from './output.js'
import { getTimeout } from './timeout.js'

// Execute a runner child process and retrieve its output.
// We are:
//  - passing JSON input with `argv`
//  - retrieving success JSON output with a specific file descriptor
//  - retrieving error string output with one or several file descriptors
// Which file descriptors are used depends on:
//  - whether `run` or `debug` is used
//  - whether this is the initial load
export const executeChild = async function ({
  commandSpawn: [file, ...args],
  commandSpawnOptions,
  input,
  input: { taskPath },
  duration,
  cwd,
  taskId,
  variationId,
  type,
}) {
  const inputA = JSON.stringify(input)

  const spawnOptions = getSpawnOptions({
    type,
    cwd,
    duration,
    commandSpawnOptions,
  })
  const child = execa(file, [...args, inputA], spawnOptions)

  // Wait for child process successful exit, failed exit, spawning error,
  // stream error or timeout
  const [
    { shortMessage, failed, timedOut },
    output,
    errorOutput,
  ] = await Promise.all([child, getOutput(child), getErrorOutput(child)])

  forwardChildError({
    shortMessage,
    failed,
    timedOut,
    duration,
    taskPath,
    errorOutput,
    taskId,
    variationId,
  })

  if (output === '') {
    return
  }

  const outputA = JSON.parse(output)
  return outputA
}

// Our spawn options have priority over commands spawn options.
const getSpawnOptions = function ({
  type,
  cwd,
  duration,
  commandSpawnOptions,
}) {
  const stdio = FDS[type]
  const timeout = getTimeout(duration)
  return {
    ...commandSpawnOptions,
    stdio,
    cwd,
    timeout,
    buffer: false,
    reject: false,
    preferLocal: true,
  }
}

// We use file descriptor 3 for IPC (success and error output).
// We are not using stdout/stderr because they are likely be used by the
// benchmarking code itself.
// We are not using `child_process` `ipc` because this would not work across
// programming languages.
// stdout/stderr are ignored in `run`. However, in `debug`, they are inherited
// during iterations. The initial `debug` load ignores them except if an error
// happens, in which case they are printed.
const FDS = {
  run: ['ignore', 'ignore', 'ignore', 'pipe'],
  loadDebug: ['ignore', 'pipe', 'pipe', 'pipe'],
  iterationDebug: ['ignore', 'inherit', 'inherit', 'pipe'],
}
