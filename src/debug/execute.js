import { spawn } from 'child_process'

import pEvent from 'p-event'

import { forwardChildError } from './error.js'

export const executeChild = async function({
  commandValue: [file, ...args],
  input,
  cwd,
  taskId,
  variationId,
}) {
  const inputA = JSON.stringify(input)

  const child = spawn(file, [...args, inputA], { stdio: STDIO, cwd })

  const { exitCode, signal, error } = await waitForExit(child)

  forwardChildError({ child, exitCode, signal, error, taskId, variationId })
}

const STDIO = ['ignore', 'inherit', 'inherit']

const waitForExit = async function(child) {
  try {
    const [exitCode, signal] = await pEvent(child, 'exit', { multiArgs: true })
    return { exitCode, signal }
  } catch (error) {
    return { error }
  }
}
