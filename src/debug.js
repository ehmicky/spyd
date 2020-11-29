import pMapSeries from 'p-map-series'

import { getCombinations } from './combination/main.js'
import { executeChild } from './processes/main.js'
import { titleColor } from './report/utils/colors.js'
import { SEPARATOR_SIGN } from './report/utils/separator.js'
import { addTitles } from './report/utils/title/main.js'

// Run tasks in debug mode
export const performDebug = async function (config) {
  const { combinations } = await getCombinations({ ...config, debug: true })
  const combinationsA = addTitles(combinations)

  await pMapSeries(combinationsA, (combination) =>
    runCombination({ ...combination, config }),
  )
}

const runCombination = async function ({
  row,
  taskPath,
  taskId,
  inputId,
  commandSpawn,
  commandSpawnOptions,
  commandConfig,
  config: { cwd },
}) {
  const name = getName(row)
  // eslint-disable-next-line no-restricted-globals, no-console
  console.log(name)

  const eventPayload = {
    type: 'debug',
    taskPath,
    runConfig: commandConfig,
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
    type: 'combinationDebug',
  })

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log('')
}

const getName = function (row) {
  return titleColor(row.join(` ${SEPARATOR_SIGN} `))
}
