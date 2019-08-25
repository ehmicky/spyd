import { getCommands } from './command.js'
import { hasTasks } from './find.js'

// Select the runners for the current benchmark files, and retrieve their
// related commands using `runner.action()`
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
  action,
}) {
  const commands = await fireAction({ runnerId, runOpt, action })
  const commandsA = await getCommands({
    runnerId,
    runnerTitle,
    runOpt,
    commands,
  })
  return { commands: commandsA, extensions }
}

// Fire runner `action()`
const fireAction = async function({ runnerId, runOpt, action }) {
  try {
    return await action(runOpt)
  } catch (error) {
    // eslint-disable-next-line fp/no-mutation
    error.message = `In runner '${runnerId}': ${error.message}`
    throw error
  }
}
