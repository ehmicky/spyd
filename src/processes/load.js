import { executeChild } from './execute.js'

// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadTaskFile = async function({
  taskPath,
  commandValue,
  commandOpt,
  duration,
  cwd,
}) {
  const input = { type: 'load', taskPath, opts: commandOpt }
  const { iterations } = await executeChild({
    commandValue,
    input,
    duration,
    cwd,
  })
  return iterations
}
