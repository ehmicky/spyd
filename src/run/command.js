// Runners can spawn multiple commands, specified as `action.commands`
export const getCommands = function({
  runnerId,
  runnerTitle,
  runOpt,
  commands,
}) {
  return commands.map(({ id, title, value }) =>
    getCommand({ runnerId, runnerTitle, runOpt, id, title, value }),
  )
}

const getCommand = function({
  runnerId,
  runnerTitle,
  runOpt,
  id,
  title,
  value,
}) {
  const commandId = [runnerId, id].filter(Boolean).join(' ')
  const commandTitle = [runnerTitle, title].filter(Boolean).join(' ')
  return {
    commandId,
    commandTitle,
    commandValue: value,
    commandOpt: runOpt,
  }
}
