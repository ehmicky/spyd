import { extname } from 'path'

import { node } from './node/main.js'

export const getRunners = function(taskPath) {
  const runners = findRunners(taskPath)
  const runnersA = normalizeRunners(runners)
  return runnersA
}

const findRunners = function(taskPath) {
  const extension = extname(taskPath)
  const runners = RUNNERS.filter(({ extensions }) =>
    matchExtension(extensions, extension),
  )

  if (runners.length === 0) {
    throw new Error(`Please specify a 'runner' for '${taskPath}'`)
  }

  return runners
}

const RUNNERS = [node]

const matchExtension = function(extensions, extension) {
  return extensions.some(extensionA => `.${extensionA}` === extension)
}

const normalizeRunners = function(runners) {
  return runners.flatMap(normalizeCommands)
}

const normalizeCommands = function({ id, commands }) {
  return commands.map(({ id: commandId, command }) =>
    normalizeCommand({ id, commandId, command }),
  )
}

const normalizeCommand = function({ id, commandId, command }) {
  const runnerId = getRunnerId(id, commandId)
  return { id: runnerId, command }
}

const getRunnerId = function(id, commandId) {
  if (commandId === undefined) {
    return id
  }

  return `${id} ${commandId}`
}
