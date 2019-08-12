import { loadRunners } from '../run/load.js'
import { findRunners } from '../run/find.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function({ taskPaths, runOpts, cwd }) {
  const { runners, versions } = await loadRunners(runOpts)

  const runnersA = getFilesRunners(taskPaths, runners)

  const iterations = await loadFilesIterations(runnersA, cwd)

  return { iterations, versions }
}

// Couple each taskPath with one or several runners/commands
const getFilesRunners = function(taskPaths, runners) {
  return taskPaths.flatMap(taskPath => getFileRunners(taskPath, runners))
}

const getFileRunners = function(taskPath, runners) {
  const runnersA = findRunners(taskPath, runners)
  const runnersB = runnersA.map(({ commands }) => ({ commands, taskPath }))
  return runnersB
}

const loadFilesIterations = async function(runners, cwd) {
  const promises = runners.map(runner => loadFileIterations(runner, cwd))
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
