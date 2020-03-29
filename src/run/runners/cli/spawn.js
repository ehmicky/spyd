import { blue } from 'chalk'
import execa from 'execa'

import { applyTemplate } from './template.js'

// Spawn a command and retrieve its output
// We use `pipe` (unless debug) so that error messages contain stdout/stderr
export const spawnOutput = async function (
  command,
  header,
  { variables, shell, debug },
) {
  const stderr = debug ? 'inherit' : 'pipe'
  const { stdout } = await spawnProcess(command, {
    variables,
    shell,
    stdio: ['ignore', 'pipe', stderr],
    debug,
    header,
  })

  if (debug && stdout !== '') {
    // eslint-disable-next-line no-restricted-globals, no-console
    console.log(stdout)
  }

  return stdout
}

// Spawn a command and do not retrieve its output
// We use `pipe` (unless debug) so that error messages contain stdout/stderr
export const spawnNoOutput = async function (
  command,
  header,
  { variables, shell, debug },
) {
  const stdio = debug ? 'inherit' : 'pipe'
  await spawnProcess(command, { variables, shell, stdio, debug, header })
}

const spawnProcess = async function (
  command,
  { variables, shell, stdio, debug, header },
) {
  const commandA = applyTemplate(command, variables).trim()

  if (debug) {
    // eslint-disable-next-line no-restricted-globals, no-console
    console.log(blue.bold(`${header}: ${commandA}`))
  }

  const execaFunc = shell ? execa : execa.command
  // Errors are propagated
  const result = await execaFunc(commandA, { stdio, shell, preferLocal: true })
  return result
}
