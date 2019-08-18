import pMapSeries from 'p-map-series'

import { getIterations } from './iterations/main.js'
import { executeChild } from './processes/execute.js'

// Run benchmark in debug mode
export const debugBenchmark = async function(opts) {
  const { iterations } = await getIterations({ ...opts, debug: true })

  await pMapSeries(iterations, iteration =>
    runIteration({ ...iteration, opts }),
  )
}

const runIteration = async function({
  name,
  taskPath,
  taskId,
  variationId,
  commandValue,
  commandOpt,
  opts: { cwd },
}) {
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(name)

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
    type: 'iterationDebug',
  })

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log('')
}
