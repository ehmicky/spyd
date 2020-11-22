import pMapSeries from 'p-map-series'

import { getIterations } from './iterations/main.js'
import { executeChild } from './processes/execute.js'
import { titleColor } from './report/utils/colors.js'
import { SEPARATOR_SIGN } from './report/utils/separator.js'
import { addTitles } from './report/utils/title/main.js'

// Run benchmark in debug mode
export const debugBenchmark = async function (opts) {
  const { iterations } = await getIterations({ ...opts, debug: true })
  const iterationsA = addTitles(iterations)

  await pMapSeries(iterationsA, (iteration) =>
    runIteration({ ...iteration, opts }),
  )
}

const runIteration = async function ({
  row,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandOpt,
  opts: { cwd },
}) {
  const name = getName(row)
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

const getName = function (row) {
  return titleColor(row.join(` ${SEPARATOR_SIGN} `))
}
