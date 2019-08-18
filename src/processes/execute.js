import { spawn } from 'child_process'

import getStream from 'get-stream'
import pEvent from 'p-event'

import { childTimeout } from './timeout.js'
import { forwardChildError } from './error.js'

// Execute a runner child process and retrieve its output.
// We are:
//  - passing input with `argv`
//  - retrieving output with file descriptor 4
//  - retrieving error messages with file descriptor 5
// The reasons we are not using stdout/stderr instead are:
//  - standard streams are likely be used by the benchmarking code
//  - likewise, file descriptor 3 is sometimes (though rarely) used
//  - IPC needs to work across programming languages
// Both input and output are JSON objects.
// In `debug` we do things differently:
//  - iterations uses stdout/stderr for output/error, directly piped to console
//  - initial load combines both approaches
export const executeChild = async function({
  commandValue: [file, ...args],
  input,
  duration,
  cwd,
  taskId,
  variationId,
  stdio,
  outputFd,
  errorFds,
}) {
  const inputA = JSON.stringify(input)

  const child = spawn(file, [...args, inputA], { stdio, cwd })

  const { exitCode, signal, output, errorOutput, error } = await waitForExit({
    child,
    duration,
    outputFd,
    errorFds,
  })

  forwardChildError({
    child,
    exitCode,
    signal,
    error,
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

// Wait for child process successful exit, failed exit, spawning error,
// stream error or timeout
const waitForExit = async function({ child, duration, outputFd, errorFds }) {
  try {
    const [[exitCode, signal], output, errorOutput] = await Promise.all([
      waitForChild(child, duration),
      getOutput(child, outputFd),
      getErrorOutput(child, errorFds),
    ])
    return { exitCode, signal, output, errorOutput }
  } catch (error) {
    return { error }
  }
}

// The `debug` action does not use any timeout
const waitForChild = function(child, duration) {
  const childPromise = pEvent(child, 'exit', { multiArgs: true })

  if (duration === undefined) {
    return childPromise
  }

  return childTimeout(childPromise, duration)
}

// Retrieve success output
const getOutput = function(child, outputFd) {
  if (outputFd === undefined) {
    return
  }

  return getChildFd(child, outputFd)
}

// Retrieve error output. Can be distributed over several file descriptors.
const getErrorOutput = async function(child, errorFds) {
  const errorOutputs = await Promise.all(
    errorFds.map(fd => getChildFd(child, fd)),
  )
  return errorOutputs.filter(Boolean).join('\n\n')
}

const getChildFd = async function(child, fd) {
  const output = await getStream(child.stdio[fd], { maxBuffer: MAX_BUFFER })
  return output.trim()
}

// Child process output and error output cannot exceed 100 MB
const MAX_BUFFER = 1e8
