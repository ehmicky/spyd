import { getCommands } from './command.js'
import { getVersions, loadVersions } from './versions.js'
import { hasTasks } from './find.js'

// Select the runners for the current benchmark files, and retrieve their
// related commands using `runner.action()`
export const loadRunners = async function(runners, taskPaths) {
  const runnersA = runners.filter(runner => hasTasks(runner, taskPaths))

  const runnersB = await Promise.all(runnersA.map(loadRunner))

  const versions = loadVersions(runnersB)
  return { runners: runnersB, versions }
}

const loadRunner = async function(runner) {
  const action = await fireAction(runner)

  const commands = getCommands(action)

  const versions = await getVersions(action)

  return { commands, versions, extensions: runner.extensions }
}

// Fire runner `action()`
const fireAction = async function({
  id: runnerId,
  title: runnerTitle,
  action,
  opts: runOpt,
}) {
  try {
    const { commands, versions } = await action(runOpt)
    return { runnerId, runnerTitle, runOpt, commands, versions }
  } catch (error) {
    // eslint-disable-next-line fp/no-mutation
    error.message = `In runner '${runnerId}': ${error.message}`
    throw error
  }
}
