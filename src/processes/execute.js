import { spawn } from 'child_process'

import pEvent from 'p-event'

import { FDS } from './fd.js'
import { childTimeout } from './timeout.js'
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

  const child = spawn(file, [...args, inputA], { stdio, cwd })

  const { exitCode, signal, output, errorOutput, error } = await waitForExit({
    child,
    duration,
    outputFd,
    errorFds,
  })

  forwardChildError({
    child,
    taskPath,
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
