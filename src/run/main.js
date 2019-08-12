import { extname } from 'path'

import { getActionsCommands } from './command.js'
import { getActionsVersions } from './versions.js'

// Retrieve the commands for a specific task file
export const getCommands = async function(taskPath, runners) {
  const runnersA = findRunners(taskPath, runners)

  const actions = await fireActions(runnersA)

  const commands = getActionsCommands(actions)

  const versions = await getActionsVersions(actions)

  return { commands, versions }
}

// Find the runners according to the task file extension
const findRunners = function(taskPath, runners) {
  const extension = extname(taskPath)
  const runnersA = runners.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )

  if (runnersA.length === 0) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return runnersA
}

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

// Fire runners `action()`
const fireActions = async function(runners) {
  const actions = await Promise.all(runners.map(fireAction))
  return actions
}

const fireAction = async function({
  id: runnerId,
  title: runnerTitle,
  action,
  runOpt,
}) {
  const { commands, versions } = await action(runOpt)
  return { runnerId, runnerTitle, runOpt, commands, versions }
}
