import { loadRunners } from '../run/load.js'
import { getCommands } from '../run/main.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function({ taskPaths, runOpts, cwd }) {
  const runners = await loadRunners(runOpts)

  const files = await loadFilesCommands(taskPaths, runners)

  const iterations = await loadFilesIterations(files, cwd)

  const versions = loadVersions(files)

  return { iterations, versions }
}

const loadFilesCommands = async function(taskPaths, runners) {
  const promises = taskPaths.map(taskPath =>
    loadFileCommands(taskPath, runners),
  )
  const files = await Promise.all(promises)
  return files
}

const loadFileCommands = async function(taskPath, runners) {
  const { commands, versions } = await getCommands(taskPath, runners)
  return { taskPath, commands, versions }
}

const loadFilesIterations = async function(files, cwd) {
  const promises = files.map(file => loadFileIterations(file, cwd))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFileIterations = async function({ taskPath, commands }, cwd) {
  const promises = commands.map(command =>
    loadCommandIterations({ taskPath, command, cwd }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadCommandIterations = async function({
  taskPath,
  command,
  command: { commandValue, commandOpt },
  cwd,
}) {
  const iterations = await loadTaskFile({
    taskPath,
    commandValue,
    commandOpt,
    cwd,
  })
  return iterations.map(iteration =>
    normalizeIteration(iteration, command, taskPath),
  )
}

const normalizeIteration = function(
  { taskId, taskTitle = taskId, variationId, variationTitle = variationId },
  { commandId, commandTitle, commandValue, commandOpt },
  taskPath,
) {
  return {
    taskPath,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
    commandId,
    commandTitle,
    commandValue,
    commandOpt,
  }
}

const loadVersions = function(files) {
  return Object.fromEntries(files.flatMap(getVersion))
}

const getVersion = function({ versions }) {
  return versions
}
