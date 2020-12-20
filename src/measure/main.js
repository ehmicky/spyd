import { getBenchmarkEnd } from './duration.js'
import { runProcesses } from './process.js'
import { addInitProps, getFinalProps } from './props.js'
import { startServer, stopServer } from './server.js'

export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  progressState,
}) {
  const benchmarkEnd = getBenchmarkEnd(combinations, duration)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(progressState, { benchmarkEnd })

  const combinationsA = combinations.map(addInitProps)
  const combinationsB = await measureAllCombinations({
    combinations: combinationsA,
    duration,
    cwd,
    benchmarkEnd,
  })
  const combinationsC = combinationsB.map(getFinalProps)
  return combinationsC
}

const measureAllCombinations = async function ({
  combinations,
  duration,
  cwd,
  benchmarkEnd,
}) {
  const {
    server,
    origin,
    combinations: combinationsA,
    onOrchestratorError,
  } = await startServer(combinations, duration)

  try {
    return await runProcesses({
      combinations: combinationsA,
      origin,
      cwd,
      benchmarkEnd,
      onOrchestratorError,
    })
  } finally {
    await stopServer(server)
  }
}
