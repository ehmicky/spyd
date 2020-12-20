import { promisify } from 'util'

import now from 'precise-now'

import { getBenchmarkEnd } from './duration.js'
import { initOrchestrators } from './orchestrator.js'
import { runProcesses } from './process.js'
import { addInitProps, getFinalProps } from './props.js'
import { startServer, stopServer } from './server.js'

const pSetTimeout = promisify(setTimeout)

export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  progressState,
}) {
  const benchmarkEnd = getBenchmarkEnd(combinations, duration)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { benchmarkEnd })

  const combinationsA = combinations.map(addInitProps)
  await measureAllCombinations({
    combinations: combinationsA,
    duration,
    cwd,
    benchmarkEnd,
  })
  const combinationsB = combinationsA.map(getFinalProps)

  await waitForTimeLeft(benchmarkEnd)
  return combinationsB
}

const measureAllCombinations = async function ({
  combinations,
  duration,
  cwd,
  benchmarkEnd,
}) {
  const { server, origin } = await startServer(duration)

  try {
    const onOrchestratorError = initOrchestrators({
      server,
      combinations,
      benchmarkEnd,
    })
    await runProcesses({ combinations, origin, cwd, onOrchestratorError })
  } finally {
    await stopServer(server)
  }
}

// We stop measuring when the next sample is most likely to go beyond the target
// `duration`.
// We still wait for the time left. This wastes some time but prevents the
// progress timer from jumping fast-forward at the end, giving the feeling of a
// smooth countdown instead.
const waitForTimeLeft = async function (benchmarkEnd) {
  const timeLeft = (benchmarkEnd - now()) / NANOSECS_TO_MSECS

  if (timeLeft <= 0) {
    return
  }

  await pSetTimeout(timeLeft)
}

const NANOSECS_TO_MSECS = 1e6
