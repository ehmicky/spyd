import { getCommandDescription } from './description.js'

// Runners can spawn multiple commands, specified as `action.commands`
export const getCommands = function({
  runnerId,
  runnerTitle,
  runOpt,
  commands,
}) {
  return Promise.all(
    commands.map(({ id, title, value, versions }) =>
      getCommand({ runnerId, runnerTitle, runOpt, id, title, value, versions }),
    ),
  )
}

const getCommand = async function({
  runnerId,
  runnerTitle,
  runOpt,
  id,
  title,
  value,
  versions,
}) {
  const commandId = id === undefined ? runnerId : `${runnerId}_${id}`
  const commandTitle =
    title === undefined ? runnerTitle : `${runnerTitle} ${title}`
  const commandDescription = await getCommandDescription({
    commandTitle,
    versions,
    runnerId,
  })
  return {
    commandRunner: runnerId,
    commandId,
    commandTitle,
    commandDescription,
    commandValue: value,
    commandOpt: runOpt,
  }
}
