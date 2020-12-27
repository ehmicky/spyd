import { spawnProcess } from '../spawn.js'

// Retrieve `file.variables`
export const getVariables = async function ({
  entries: { variables: fileVariables = {}, ...entries },
  variables,
  shell,
}) {
  const fileVariablesA = await Promise.all(
    Object.entries(fileVariables).map(([name, command]) =>
      getVariable({ name, command, variables, shell }),
    ),
  )
  const fileVariablesB = Object.fromEntries(fileVariablesA)

  const variablesA = { ...variables, ...fileVariablesB }
  return { variables: variablesA, entries }
}

const getVariable = async function ({ name, command, variables, shell }) {
  try {
    const stdout = await spawnProcess(command, {
      variables,
      shell,
      stdout: 'pipe',
      stderr: 'ignore',
    })
    return [name, stdout]
  } catch (error) {
    throw new Error(`Could not use variable '${name}': ${error.message}`)
  }
}
