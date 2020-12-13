import execa from 'execa'

import { UserError } from '../../error/main.js'

import { measureCombination } from './combination.js'
import { getServerUrl } from './url.js'

const CLIENT_ENTRYFILE = `${__dirname}/../client/main.js`

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

const stopProcess = function ({ childProcess }) {
  childProcess.kill()
}
