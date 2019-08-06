import { startChild } from './start.js'
import { endChild } from './end.js'
import { sendChildMessage } from './ipc.js'

// At startup we run child processes but do not run an benchmarks. We only
// retrieve the task files iterations
export const loadTaskFile = async function({ taskPath, runner, cwd }) {
  const { iterations, child } = await startChild({ taskPath, runner, cwd })

  await sendChildMessage(child, 'end')
  await endChild(child)

  return iterations
}
