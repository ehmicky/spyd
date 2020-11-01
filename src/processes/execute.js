import execa from 'execa'
import { file as getTmpFile } from 'tmp-promise'

import { forwardChildError } from './error.js'
import { getResult } from './result.js'
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
  const {
    shortMessage,
    failed,
    timedOut,
    stdout,
    stderr,
    result,
  } = await spawnFile({
    commandSpawn,
    commandSpawnOptions,
    input,
    duration,
    cwd,
    type,
  })

  forwardChildError({
    shortMessage,
    failed,
    timedOut,
    duration,
    taskPath,
    stdout,
    stderr,
    result,
    taskId,
    variationId,
  })

  return result
}

const spawnFile = async function ({
  commandSpawn: [file, ...args],
  commandSpawnOptions,
  input,
  duration,
  cwd,
  type,
}) {
  const { path: resultFile, cleanup } = await getTmpFile({
    template: RESULT_FILENAME,
  })

  try {
    const inputStr = JSON.stringify({ ...input, resultFile })
    const spawnOptions = getSpawnOptions({
      commandSpawnOptions,
      duration,
      cwd,
      type,
    })
    const { shortMessage, failed, timedOut, stdout, stderr } = await execa(
      file,
      [...args, inputStr],
      spawnOptions,
    )
    const result = await getResult(resultFile, failed)
    return { shortMessage, failed, timedOut, stdout, stderr, result }
  } finally {
    await cleanup()
  }
}

const RESULT_FILENAME = 'spyd-XXXXXX.json'

// Our spawn options have priority over commands spawn options.
const getSpawnOptions = function ({
  commandSpawnOptions,
  duration,
  cwd,
  type,
}) {
  const stdio = STDIO[type]
  const timeout = getTimeout(duration)
  return {
    ...commandSpawnOptions,
    stdio,
    cwd,
    timeout,
    maxBuffer: MAX_BUFFER,
    reject: false,
    preferLocal: true,
  }
}

// For IPC (success and error output), we use a file instead of:
//  - stdout/stderr: they are likely be used by the benchmarking code itself
//  - `child_process` `ipc`: would not work across programming languages
// stdout/stderr are:
//  - ignored in `run`
//  - printed in `debug` iterations
//  - not printed in `debug` load, unless an error happened
const STDIO = {
  run: ['ignore', 'ignore', 'ignore'],
  loadDebug: ['ignore', 'pipe', 'pipe'],
  iterationDebug: ['ignore', 'inherit', 'inherit'],
}
const MAX_BUFFER = 1e8
