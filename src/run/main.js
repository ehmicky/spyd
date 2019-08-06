import { extname } from 'path'

// Retrieve the runners for a specific task file
export const getRunners = function(taskPath, allRunners) {
  const runners = findRunners(taskPath, allRunners)
  const runnersA = normalizeRunners(runners)
  return runnersA
}

// Find the runners according to the task file extension
const findRunners = function(taskPath, allRunners) {
  const extension = extname(taskPath)
  const runners = allRunners.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )

  if (runners.length === 0) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return runners
}

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

// Runners can spawn multiple commands
const normalizeRunners = function(runners) {
  return runners.flatMap(normalizeCommands)
}

const normalizeCommands = function({ id, commands, runOpt, versions }) {
  const commandsA = commands(runOpt)
  return commandsA.map(({ id: commandId, command }) =>
    normalizeCommand({ id, commandId, command, runOpt, versions }),
  )
}

const normalizeCommand = function({
  id,
  commandId,
  command,
  runOpt,
  versions,
}) {
  const runnerId = getRunnerId(id, commandId)
  return { id: runnerId, command, runOpt, versions }
}

const getRunnerId = function(id, commandId) {
  if (commandId === undefined) {
    return id
  }

  return `${id} ${commandId}`
}
