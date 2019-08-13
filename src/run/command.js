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
  id: commandId,
  title: commandTitle,
  value: commandValue,
}) {
  const commandIdA = [runnerId, commandId].filter(Boolean).join(' ')
  const commandTitleA = [runnerTitle, commandTitle].filter(Boolean).join(' ')
  return {
    commandId: commandIdA,
    commandTitle: commandTitleA,
    commandValue,
    commandOpt: runOpt,
  }
}
