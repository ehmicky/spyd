import { loadTaskFile } from '../load/main.js'

import { getTaskPaths } from './path.js'
import { addPaddings } from './paddings.js'

// Retrieve each iteration, i.e. combination of task + variation (if any)
export const getIterations = async function({ files, cwd, requireOpt }) {
  const taskPaths = await getTaskPaths(files, cwd)

  const iterations = await loadIterations(taskPaths, requireOpt)

  const iterationsA = addPaddings(iterations)
  return iterationsA
}

const loadIterations = async function(taskPaths, requireOpt) {
  const promises = taskPaths.map(taskPath => loadTaskFile(taskPath, requireOpt))
  const iterations = await Promise.all(promises)
  const iterationsA = iterations.flat()
  return iterationsA
}
