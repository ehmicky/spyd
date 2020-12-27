import { runProcesses } from './process.js'
import { addInitProps, getFinalProps } from './props.js'
import { startServer, stopServer } from './server.js'

export const measureCombinations = async function ({
  combinations,
  config: { duration, cwd },
  progressState,
}) {
  const combinationsA = combinations.map((combination) =>
    addInitProps(combination, duration),
  )
  const combinationsB = await measureAllCombinations({
    combinations: combinationsA,
    duration,
    cwd,
    progressState,
  })
  const combinationsC = combinationsB.map(getFinalProps)
  return combinationsC
}

const measureAllCombinations = async function ({
  combinations,
  duration,
  cwd,
  progressState,
}) {
  const { server, origin, combinations: combinationsA } = await startServer(
    combinations,
    duration,
  )

  try {
    return await runProcesses({
      combinations: combinationsA,
      origin,
      cwd,
      progressState,
    })
  } finally {
    await stopServer(server)
  }
}
