import { executeChild } from './execute.js'

// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
export const runChild = async function({
  processDuration,
  duration,
  taskPath,
  taskId,
  variationId,
  commandValue,
  commandOpt,
  cwd,
}) {
  const input = {
    type: 'run',
    taskPath,
    opts: commandOpt,
    taskId,
    variationId,
    duration: processDuration,
  }
  const { times, count } = await executeChild({
    commandValue,
    input,
    duration,
    cwd,
  })
  return { times, count }
}
