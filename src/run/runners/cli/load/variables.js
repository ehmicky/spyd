import { env } from 'process'

import { spawnCommand } from '../spawn.js'

// Get initial set of variables
export const getInitialVariables = function() {
  return env
}

export const getVariables = async function({
  entries: { variables: fileVariables, ...entries },
  variables,
  shell,
  stdio,
}) {
  const fileVariablesA = await Promise.all(
    Object.entries(fileVariables).map(([name, command]) =>
      getVariable({ name, command, variables, shell, stdio }),
    ),
  )
  const fileVariablesB = Object.fromEntries(fileVariablesA)

  const variablesA = { ...variables, ...fileVariablesB }
  return { variables: variablesA, entries }
}

const getVariable = async function({ name, command, variables, shell, stdio }) {
  try {
    const stdout = await spawnCommand(command, { variables, shell, stdio })
    return [name, stdout]
  } catch (error) {
    throw new Error(`Could not use variable '${name}': ${error.message}`)
  }
}
