import { spawnOutput } from '../spawn.js'

// Retrieve `file.variables`
export const getVariables = async function({
  entries: { variables: fileVariables = {}, ...entries },
  variables,
  shell,
  debug,
}) {
  const fileVariablesA = await Promise.all(
    Object.entries(fileVariables).map(([name, command]) =>
      getVariable({ name, command, variables, shell, debug }),
    ),
  )
  const fileVariablesB = Object.fromEntries(fileVariablesA)

  const variablesA = { ...variables, ...fileVariablesB }
  return { variables: variablesA, entries }
}

const getVariable = async function({ name, command, variables, shell, debug }) {
  try {
    const stdout = await spawnOutput(command, `Variable '${name}'`, {
      variables,
      shell,
      debug,
    })
    return [name, stdout]
  } catch (error) {
    throw new Error(`Could not use variable '${name}': ${error.message}`)
  }
}
