import { UserError, PluginError } from '../error/main.js'

import { getCommands } from './command.js'
import { hasTasks } from './find.js'

// Select the runners for the current tasks files, and retrieve their
// related commands using `runner.commands()`
export const loadRunners = async function (runners, taskPaths) {
  const runnersA = runners.filter((runner) => hasTasks(runner, taskPaths))

  const runnersB = await Promise.all(runnersA.map(loadRunner))
  return runnersB
}

const loadRunner = async function ({
  id: runnerId,
  title: runnerTitle,
  repeat: runnerRepeats,
  config: runConfig,
  extensions,
  commands: retrieveCommands,
}) {
  const commands = await fireCommands({ runnerId, runConfig, retrieveCommands })
  const commandsA = await getCommands({
    runnerId,
    runnerTitle,
    runnerRepeats,
    runConfig,
    commands,
  })
  return { commands: commandsA, extensions }
}

// Fire `runner.commands()`
const fireCommands = async function ({
  runnerId,
  runConfig,
  retrieveCommands,
}) {
  try {
    return await retrieveCommands(runConfig)
  } catch (error) {
    handleCommandsError(error, runnerId)
  }
}

const handleCommandsError = function (error, runnerId) {
  if (error instanceof UserError) {
    throw new UserError(`In runner '${runnerId}': ${error.message}`)
  }

  throw new PluginError(`Runner '${runnerId}' internal error: ${error.stack}`)
}
