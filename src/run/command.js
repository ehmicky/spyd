// Runners can spawn multiple commands
export const getActionsCommands = function(actions) {
  return actions.flatMap(normalizeCommands)
}

const normalizeCommands = function({
  runnerId,
  runnerTitle,
  runOpt,
  commands,
}) {
  return commands.map(
    ({ id: commandId, title: commandTitle, value: commandValue }) =>
      normalizeCommand({
        runnerId,
        runnerTitle,
        runOpt,
        commandId,
        commandTitle,
        commandValue,
      }),
  )
}

const normalizeCommand = function({
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
