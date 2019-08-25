import execa from 'execa'

import { applyTemplate } from './template.js'

// Spawn a command and retrieve its output
export const spawnCommand = async function(
  command,
  { variables, shell, stdio },
) {
  const { stdout } = await spawnProcess(command, {
    variables,
    shell,
    stdio: ['ignore', 'pipe', stdio],
  })

  // In debug mode, we need to print every command's output
  if (stdio === 'inherit' && stdout !== '') {
    // eslint-disable-next-line no-restricted-globals, no-console
    console.log(stdout)
  }

  return stdout
}

// Spawn a command and retrieve its child process result
export const spawnProcess = async function(
  command,
  { variables, shell, stdio },
) {
  const commandA = applyTemplate(command, variables)

  const execaFunc = shell ? execa : execa.command
  // Errors are propagated
  const result = await execaFunc(commandA, { stdio, shell, preferLocal: true })
  return result
}
