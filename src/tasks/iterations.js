import { getTaskPaths } from './path.js'
import { loadTaskFile } from './load.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({
  files,
  cwd,
  duration,
  requireOpt,
}) {
  const taskPaths = await getTaskPaths(files, cwd)

  const tasks = await loadTasks(taskPaths, requireOpt)
  const iterations = tasks
    .flatMap(getIteration)
    .map(iteration => ({ ...iteration, duration, requireOpt }))
  const iterationsA = addPaddings(iterations)
  return iterationsA
}

const loadTasks = async function(taskPaths, requireOpt) {
  const promises = taskPaths.map(taskPath => loadTaskFile(taskPath, requireOpt))
  const tasks = await Promise.all(promises)
  const tasksA = tasks.flat()
  return tasksA
}

const getIteration = function({ taskPath, taskId, taskTitle, variations }) {
  if (variations === undefined) {
    return [{ taskPath, taskId, taskTitle }]
  }

  return variations.map(({ variationId, variationTitle }) => ({
    taskPath,
    taskId,
    taskTitle,
    variationId,
    variationTitle,
  }))
}
