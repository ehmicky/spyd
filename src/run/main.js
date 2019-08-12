import { extname } from 'path'

// Retrieve the commands for a specific task file
export const getCommands = function(taskPath, runners) {
  const runnersA = findRunners(taskPath, runners)
  const commands = runnersA.flatMap(normalizeCommands)
  return commands
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

// Runners can spawn multiple commands
const normalizeCommands = function({
  id: runnerId,
  title: runnerTitle,
  action,
  runOpt,
  versions,
}) {
  const { commands } = action(runOpt)
  return commands.map(
    ({ id: commandId, title: commandTitle, value: commandValue }) =>
      normalizeCommand({
        runnerId,
        runnerTitle,
        commandId,
        commandTitle,
        commandValue,
        runOpt,
        versions,
      }),
  )
}

const normalizeCommand = function({
  runnerId,
  runnerTitle,
  commandId,
  commandTitle,
  commandValue,
  runOpt,
  versions,
}) {
  const commandIdA = [runnerId, commandId].filter(Boolean).join(' ')
  const commandTitleA = [runnerTitle, commandTitle].filter(Boolean).join(' ')
  return {
    commandId: commandIdA,
    commandTitle: commandTitleA,
    commandValue,
    commandOpt: runOpt,
    versions,
  }
}
