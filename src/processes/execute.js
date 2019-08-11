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
//  - hooking into the child's stderr to display it in error messages in case
//    the process failed
// Both input and output are JSON objects.
export const executeChild = async function({
  commandValue: [file, ...args],
  input,
  duration,
  cwd,
}) {
  const inputA = JSON.stringify(input)

  const child = spawn(file, [...args, inputA], {
    stdio: ['ignore', 'ignore', 'pipe', 'ignore', 'pipe'],
    cwd,
  })
  const outputPromise = getStream(child.stdio[OUTPUT_FD])
  const stderrPromise = getStream(child.stderr)

  const { exitCode, signal, error } = await childTimeout(
    waitForExit(child),
    duration,
  )

  await forwardChildError({ exitCode, signal, error, stderrPromise })

  const output = await outputPromise
  const outputA = JSON.parse(output)
  return outputA
}

const OUTPUT_FD = 4

// Wait for child process exit, successful or not
const waitForExit = async function(child) {
  try {
    const [exitCode, signal] = await pEvent(child, 'exit', { multiArgs: true })
    return { exitCode, signal }
  } catch (error) {
    return { error }
  }
}
