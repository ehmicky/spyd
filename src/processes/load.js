import { startChild } from './start.js'
import { endChild } from './end.js'

// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadTaskFile = async function({
  taskPath,
  commandValue,
  commandOpt,
  cwd,
}) {
  const { iterations, child } = await startChild({
    taskPath,
    commandValue,
    commandOpt,
    cwd,
  })

  await endChild(child)

  return iterations
}
