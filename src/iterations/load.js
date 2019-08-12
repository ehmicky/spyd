import { loadRunners } from '../run/load.js'
import { getCommands } from '../run/main.js'
import { getVersions } from '../run/versions.js'
import { loadTaskFile } from '../processes/load.js'

// Load iterations by launching each runner
export const loadIterations = async function({ taskPaths, runOpts, cwd }) {
  const runners = await loadRunners(runOpts)

  const promises = taskPaths.map(taskPath =>
    loadFiles({ taskPath, runners, cwd }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()

  const versions = {} // await getVersions(iterationsA)

  return { iterations: iterationsA, versions }
}

const loadFiles = async function({ taskPath, runners, cwd }) {
  const commands = getCommands(taskPath, runners)
  const promises = commands.map(command => loadFile({ taskPath, command, cwd }))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFile = async function({
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
