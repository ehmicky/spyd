// Runners can spawn multiple commands
export const getActionsCommands = function(actions) {
  return actions.flatMap(getCommands)
}

const getCommands = function({ runnerId, runnerTitle, runOpt, commands }) {
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
