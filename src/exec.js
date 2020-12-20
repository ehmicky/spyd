import { promisify } from 'util'

import pMapSeries from 'p-map-series'

import { getCombinations } from './combination/main.js'
import { UserError } from './error/main.js'
import { titleColor } from './report/utils/colors.js'
import { SEPARATOR_SIGN } from './report/utils/separator.js'
import { addTitles } from './report/utils/title/main.js'

const pSetTimeout = promisify(setTimeout)

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
  config: { cwd, duration },
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
    maxDuration: -1,
    repeat,
  }

  await Promise.race([
    waitForSampleTimeout(duration),
    executeChild({
      commandSpawn,
      commandSpawnOptions,
      eventPayload,
      cwd,
      taskId,
      inputId,
      type: 'benchmarkExec',
    }),
  ])

  // eslint-disable-next-line no-restricted-globals, no-console
  console.log('')
}

const getName = function (row) {
  return titleColor(row.join(` ${SEPARATOR_SIGN} `))
}

// Unlike the `bench` action, we use timeouts in the `exec` action. This allows
// debugging combinations that hang forever or are too long.
const waitForSampleTimeout = async function (duration) {
  const sampleTimeout = Math.round(duration / NANOSECS_TO_MILLISECS)
  await pSetTimeout(sampleTimeout)

  throw new UserError(
    'Task timed out. Please increase the "duration" configuration property.',
  )
}

const NANOSECS_TO_MILLISECS = 1e6
