import { getCommands } from './command.js'
import { hasTasks } from './find.js'

// Select the runners for the current benchmark files, and retrieve their
// related commands using `runner.commands()`
export const loadRunners = async function(runners, taskPaths) {
  const runnersA = runners.filter(runner => hasTasks(runner, taskPaths))

  const runnersB = await Promise.all(runnersA.map(loadRunner))
  return runnersB
}

const loadRunner = async function({
  id: runnerId,
  title: runnerTitle,
  opts: runOpt,
  extensions,
  commands: retrieveCommands,
}) {
  const commands = await fireCommands({ runnerId, runOpt, retrieveCommands })
  const commandsA = await getCommands({
    runnerId,
    runnerTitle,
    runOpt,
    commands,
  })
  return { commands: commandsA, extensions }
}

// Fire `runner.commands()`
const fireCommands = async function({ runnerId, runOpt, retrieveCommands }) {
  try {
    return await retrieveCommands(runOpt)
  } catch (error) {
    // eslint-disable-next-line fp/no-mutation
    error.message = `In runner '${runnerId}': ${error.message}`
    throw error
  }
}
