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

  const child = spawn(file, [...args, inputA], {
    stdio: ['ignore', 'ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
    cwd,
  })
  const outputPromise = getStream(child.stdio[OUTPUT_FD])
  const errorPromise = getStream(child.stdio[ERROR_FD])

  const { exitCode, signal, error } = await childTimeout(waitForExit(child), {
    duration,
    taskId,
    variationId,
  })

  await forwardChildError({
    exitCode,
    signal,
    error,
    errorPromise,
    taskId,
    variationId,
  })

  const output = await outputPromise
  const outputA = JSON.parse(output)
  return outputA
}

const OUTPUT_FD = 4
const ERROR_FD = 5

// Wait for child process exit, successful or not
const waitForExit = async function(child) {
  try {
    const [exitCode, signal] = await pEvent(child, 'exit', { multiArgs: true })
    return { exitCode, signal }
  } catch (error) {
    return { error }
  }
}
