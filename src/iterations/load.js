import { findRunners } from '../run/find.js'
import { executeChild } from '../processes/execute.js'

// Load iterations by launching each runner
// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadIterations = async function({
  taskPaths,
  runners,
  duration,
  cwd,
}) {
  const iterations = await Promise.all(
    taskPaths.map(taskPath =>
      getFilesIterations({ taskPath, runners, duration, cwd }),
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
}) {
  const runnersA = findRunners(taskPath, runners)
  const iterations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileIterations({ taskPath, commands, duration, cwd }),
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
}) {
  const iterations = await Promise.all(
    commands.map(command =>
      getCommandIterations({ taskPath, command, duration, cwd }),
    ),
  )
  const iterationsA = iterations.flat()
  return iterationsA
}

const getCommandIterations = async function({
  taskPath,
  command,
  command: { commandValue, commandOpt },
  duration,
  cwd,
}) {
  const input = { type: 'load', taskPath, opts: commandOpt }
  const { iterations } = await executeChild({
    commandValue,
    input,
    duration,
    cwd,
    stdio: ['ignore', 'ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
    fds: [4, 5],
  })
  const iterationsA = iterations.map(iteration =>
    normalizeIteration(iteration, command, taskPath),
  )
  return iterationsA
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
