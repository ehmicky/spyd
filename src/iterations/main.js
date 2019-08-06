import { getRunners } from '../run/main.js'
import { loadTaskFile } from '../processes/load.js'

import { getTaskPaths } from './path.js'
import { selectIterations } from './select.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  cwd,
  tasks: taskIds,
  variations: variationIds,
  requireOpt,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const iterations = await loadIterations({
    taskPaths,
    taskIds,
    variationIds,
    requireOpt,
  })

  const iterationsA = addPaddings(iterations)
  return iterationsA
}

const loadIterations = async function({
  taskPaths,
  taskIds,
  variationIds,
  requireOpt,
}) {
  const promises = taskPaths.map(taskPath => loadFiles(taskPath, requireOpt))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat().filter(removeDuplicates)
  const iterationsB = selectIterations({
    iterations: iterationsA,
    taskIds,
    variationIds,
  })

  if (iterationsB.length === 0) {
    throw new Error('No tasks to bechmark')
  }

  return iterationsB
}

const loadFiles = async function(taskPath, requireOpt) {
  const runners = getRunners(taskPath)
  const promises = runners.map(runner =>
    loadFile({ taskPath, runner, requireOpt }),
  )
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}

const loadFile = async function({
  taskPath,
  runner,
  runner: { command },
  requireOpt,
}) {
  const iterations = await loadTaskFile({ taskPath, command, requireOpt })
  return iterations.map(iteration =>
    normalizeIteration(iteration, runner, taskPath),
  )
}

const normalizeIteration = function(
  { taskId, taskTitle = taskId, variationId, variationTitle = variationId },
  { id: runnerId, title: runnerTitle = runnerId, command },
  taskPath,
) {
  return {
    taskPath,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
    runnerId,
    runnerTitle,
    command,
  }
}

// When two `files` define the same iteration, the last one prevails
const removeDuplicates = function(
  { taskId, variationId, runnerId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.runnerId !== runnerId,
    )
}
