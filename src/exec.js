import pMapSeries from 'p-map-series'

import { getCombinations } from './combination/main.js'
import { executeChild } from './processes/main.js'
import { titleColor } from './report/utils/colors.js'
import { SEPARATOR_SIGN } from './report/utils/separator.js'
import { addTitles } from './report/utils/title/main.js'

// Execute tasks without benchmarking them
export const performExec = async function (config) {
  const { combinations } = await getCombinations(config)
  const combinationsA = addTitles(combinations)

  await pMapSeries(combinationsA, (combination) =>
    execCombination({ ...combination, config }),
  )
}

const execCombination = async function ({
  row,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  runnerRepeats,
  config: { cwd },
}) {
  const name = getName(row)
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(name)

  const repeat = runnerRepeats ? 1 : undefined
  const eventPayload = {
    type: 'benchmark',
    runConfig: commandConfig,
    taskPath,
    taskId,
    inputId,
    dry: false,
    maxDuration: -1,
    repeat,
  }

  await executeChild({
    commandSpawn,
    commandSpawnOptions,
    eventPayload,
    cwd,
    taskId,
    inputId,
    type: 'benchmarkExec',
  })

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log('')
}

const getName = function (row) {
  return titleColor(row.join(` ${SEPARATOR_SIGN} `))
}
