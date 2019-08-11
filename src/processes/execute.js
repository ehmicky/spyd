import { spawn } from 'child_process'

import getStream from 'get-stream'
import pEvent from 'p-event'

import { childTimeout } from './timeout.js'
import { forwardChildError } from './error.js'

// Execute a runner child process and retrieve its output
// We are:
//  - passing input with `argv`
//  - retrieving output with file descriptor 4. The reason we do this is:
//     - IPC needs to work across programming languages
//     - standard streams are likely be used by the benchmarking code
//     - likewise, file descriptor 3 is sometimes (though rarely) used
//  - retrieving error messages with file descriptor 5. We don't use stderr
//    for the same reason. Also we don't want to display repeated stderr from
//    the benchmarked code.
// Both input and output are JSON objects.
export const executeChild = async function({
  commandValue: [file, ...args],
  input,
  duration,
  cwd,
  taskId,
  variationId,
}) {
  const inputA = JSON.stringify(input)

  const child = spawn(file, [...args, inputA], { stdio: STDIO, cwd })

  const { exitCode, signal, output, errorOutput, error } = await waitForExit(
    child,
    duration,
  )

  forwardChildError({
    child,
    exitCode,
    signal,
    error,
    errorOutput,
    taskId,
    variationId,
  })

  const outputA = JSON.parse(output)
  return outputA
}

const STDIO = ['ignore', 'ignore', 'ignore', 'ignore', 'pipe', 'pipe']
const OUTPUT_FD = 4
const ERROR_FD = 5

// Wait for child process exit, successful or not
const waitForExit = async function(child, duration) {
  try {
    const [[exitCode, signal], output, errorOutput] = await Promise.all([
      childTimeout(pEvent(child, 'exit', { multiArgs: true }), duration),
      getStream(child.stdio[OUTPUT_FD], { maxBuffer: MAX_BUFFER }),
      getStream(child.stdio[ERROR_FD], { maxBuffer: MAX_BUFFER }),
    ])
    return { exitCode, signal, output, errorOutput }
  } catch (error) {
    return { error }
  }
}

// Child process output and error output cannot exceed 100 MB
const MAX_BUFFER = 1e8
