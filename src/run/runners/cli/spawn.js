import execa from 'execa'

import { applyTemplate } from './template.js'

// Spawn a command and retrieve its output
export const spawnOutput = async function(
  command,
  { variables, shell, debug },
) {
  const stderr = debug ? 'inherit' : 'ignore'
  const { stdout } = await spawnProcess(command, {
    variables,
    shell,
    stdio: ['ignore', 'pipe', stderr],
  })

  if (debug && stdout !== '') {
    // eslint-disable-next-line no-restricted-globals, no-console
    console.log(stdout)
  }

  return stdout
}

// Spawn a command and do not retrieve its output
export const spawnNoOutput = async function(
  command,
  { variables, shell, debug },
) {
  const stdio = debug ? 'inherit' : 'ignore'
  await spawnProcess(command, { variables, shell, stdio })
}

const spawnProcess = async function(command, { variables, shell, stdio }) {
  const commandA = applyTemplate(command, variables)

  const execaFunc = shell ? execa : execa.command
  // Errors are propagated
  const result = await execaFunc(commandA, { stdio, shell, preferLocal: true })
  return result
}
