import { findRunners } from '../run/find.js'

import { getCommandIterations } from './get.js'

// Load iterations by launching each combination of
// benchmark files + runners commands
export const loadIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
  debug,
  env,
}) {
  const iterations = await Promise.all(
    taskPaths.map(taskPath =>
      getFilesIterations({ taskPath, runners, duration, cwd, debug, env }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFilesIterations = async function({
  taskPath,
  runners,
  duration,
  cwd,
  debug,
  env,
}) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileIterations({ taskPath, commands, duration, cwd, debug, env }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getFileIterations = async function({
  taskPath,
  commands,
  duration,
  cwd,
  debug,
  env,
}) {
  const iterations = await Promise.all(
    commands.map(command =>
      getCommandIterations({ taskPath, command, duration, cwd, debug, env }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}
