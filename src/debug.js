import pMapSeries from 'p-map-series'

import { getIterations } from './iterations/main.js'
import { executeChild } from './processes/execute.js'

// Run benchmark in debug mode
export const debugBenchmark = async function (opts) {
  const { iterations } = await getIterations({ ...opts, debug: true })

  await pMapSeries(iterations, (iteration) =>
    runIteration({ ...iteration, opts }),
  )
}

const runIteration = async function ({
  name,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  opts: { cwd },
}) {
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(name)

  const eventPayload = {
    type: 'debug',
    taskPath,
    opts: commandOpt,
    taskId,
    inputId,
  }

  await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    cwd,
    taskId,
    inputId,
    type: 'iterationDebug',
  })

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log('')
}
