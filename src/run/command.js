// Runners can spawn multiple commands, specified as `action.commands`
export const getCommands = function({
  runnerId,
  runnerTitle,
  runOpt,
  commands,
}) {
  return commands.map(
    ({ id: commandId, title: commandTitle, value: commandValue }) =>
      getCommand({
        runnerId,
        runnerTitle,
        runOpt,
        commandId,
        commandTitle,
        commandValue,
      }),
  )
}

const getCommand = function({
  runnerId,
  runnerTitle,
  runOpt,
  commandId,
  commandTitle,
  commandValue,
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
