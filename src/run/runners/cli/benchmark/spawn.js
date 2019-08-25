import execa from 'execa'

import { applyTemplate } from '../template.js'

// Errors are propagated
export const spawnProcess = async function(
  command,
  { variables, shell, stdio },
) {
  const commandA = applyTemplate(command, variables)

  const execaFunc = shell ? execa : execa.command
  const result = await execaFunc(commandA, { stdio, shell, preferLocal: true })
  return result
}
