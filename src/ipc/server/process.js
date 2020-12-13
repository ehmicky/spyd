import { promisify } from 'util'

import execa from 'execa'

import { UserError } from '../../error/main.js'

import { measureCombination } from './combination.js'
import { getServerUrl } from './url.js'

const CLIENT_ENTRYFILE = `${__dirname}/../client/main.js`

const pSetTimeout = promisify(setTimeout)

export const runProcesses = async function ({
  combinations,
  origin,
  duration,
}) {
  const combinationProcesses = combinations.map((combination) =>
    startProcess({ combination, origin }),
  )

  try {
    await Promise.all(
      combinationProcesses.map(({ childProcess, combination }) =>
        runProcess({ childProcess, combination, duration }),
      ),
    )
  } finally {
    combinationProcesses.forEach(stopProcess)
  }
}

const startProcess = function ({
  combination,
  combination: { taskId, clientId },
  origin,
}) {
  const serverUrl = getServerUrl(origin, clientId)
  const loadInputString = JSON.stringify({ serverUrl, taskId })
  const childProcess = execa('node', [CLIENT_ENTRYFILE, loadInputString], {
    stdio: 'ignore',
  })
  return { childProcess, combination }
}

const runProcess = async function ({ childProcess, combination, duration }) {
  await Promise.race([
    waitForProcessError(childProcess, combination),
    measureCombination({ combination, duration }),
  ])
}

// Processes runs forever (`waitToEnd()` is used instead).
// This is only done for exception handling
const waitForProcessError = async function (childProcess, { taskId }) {
  try {
    await childProcess
  } catch (error) {
    throw new UserError(`Task '${taskId}' failed:\n${error.stack}`)
  }
}

// Wait until the end of the benchmark, based on the `duration` configuration
// property.
// This is the `duration` of each combination, not of the whole benchmark.
// Otherwise:
//  - Adding/removing combinations would change the duration (and results) of
//    others
//  - This includes using the `include|exclude` configuration properties
// We also exclude the time to load both runners and tasks. This ensures adding
// imports in tasks (slowing down their load time) does not change results.
const waitToEndOld = async function (duration, combinations) {
  const totalDurationMs = Math.round(
    (duration / NANOSECS_TO_MILLISECS) * combinations.length,
  )
  await pSetTimeout(totalDurationMs)
}

const NANOSECS_TO_MILLISECS = 1e6

const stopProcess = function ({ childProcess }) {
  childProcess.kill()
}
