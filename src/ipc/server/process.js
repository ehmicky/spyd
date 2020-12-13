import execa from 'execa'

import { UserError } from '../../error/main.js'

import { measureCombination } from './combination.js'
import { getServerUrl } from './url.js'

const CLIENT_ENTRYFILE = `${__dirname}/../client/main.js`

// Each combination is spawned in its own process:
//  - This ensures runtime optimization is bound to each combination
//  - This allows runners with different programming languages
// We use a single long process per combination instead of spawning multiple
// ones:
//  - This would require setting a maximum duration or amount of measures. To
//    estimate those for different types of tasks is hard and brittle:
//      - Using hard-coded durations does not work since machines or tasks have
//        very different speeds
//      - Using the speed of the machine (by measuring the duration to spawn
//        process, load tasks, etc.) makes results vary based on non-obvious
//        factors. It is also hard to callibrate.
//      - Using the `duration` configuration property does not work when it is
//        `0`
//  - This would require loading both the runner and the task multiple times,
//    which wastes duration and does not allow runners with long initialization.
//  - Variance is higher due to task cold starts having a higher share of the
//    total measures.
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
