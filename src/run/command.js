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
  const commandId = joinCommand(runnerId, id)
  const commandTitle = joinCommand(runnerTitle, title)
  return { commandId, commandTitle, commandValue: value, commandOpt: runOpt }
}

const joinCommand = function(runnerInfo, commandInfo) {
  if (commandInfo === undefined) {
    return runnerInfo
  }

  return `${runnerInfo} ${commandInfo}`
}
