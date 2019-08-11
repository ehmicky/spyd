import { getChildMessage, sendChildMessage } from './ipc.js'
import { startChild } from './start.js'
import { endChild } from './end.js'
import { childTimeout } from './timeout.js'

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
  const { child } = await startChild({
    taskPath,
    commandValue,
    commandOpt,
    cwd,
  })

  // Tell the child process to start benchmarking
  await sendChildMessage(child, 'run', {
    taskId,
    variationId,
    duration: processDuration,
  })

  // Wait for the benchmark result
  const { times, count } = await childTimeout(
    getChildMessage(child, 'run'),
    duration,
  )

  endChild(child)

  return { times, count }
}
