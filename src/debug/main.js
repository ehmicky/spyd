import pMapSeries from 'p-map-series'

import { getIterations } from '../iterations/main.js'
import { executeChild } from '../processes/execute.js'

// Run benchmark in debug mode
export const debugBenchmark = async function(opts) {
  const { iterations } = await getIterations(opts)

  await pMapSeries(iterations, iteration =>
    runIteration({ ...iteration, opts }),
  )
}

const runIteration = async function({
  taskPath,
  taskId,
  variationId,
  commandValue,
  commandOpt,
  opts: { cwd },
}) {
  const input = {
    type: 'debug',
    taskPath,
    opts: commandOpt,
    taskId,
    variationId,
  }

  await executeChild({
    commandValue,
    input,
    cwd,
    taskId,
    variationId,
    stdio: ['ignore', 'inherit', 'inherit'],
    fds: [],
  })
}
