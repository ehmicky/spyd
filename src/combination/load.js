import { findRunners } from '../run/find.js'

import { getCommandCombinations } from './get.js'

// Load combinations by launching each combination of
// tasks files + runners commands
export const loadCombinations = async function ({
  taskPaths,
  runners,
  duration,
  cwd,
  debug,
  system,
}) {
  const combinations = await Promise.all(
    taskPaths.map((taskPath) =>
      getFilesCombinations({ taskPath, runners, duration, cwd, debug, system }),
    ),
  )
  const combinationsA = combinations.flat()
  return combinationsA
}

const getFilesCombinations = async function ({
  taskPath,
  runners,
  duration,
  cwd,
  debug,
  system,
}) {
  const runnersA = findRunners(taskPath, runners)
  const combinations = await Promise.all(
    runnersA.map(({ commands }) =>
      getFileCombinations({ taskPath, commands, duration, cwd, debug, system }),
    ),
  )
  const combinationsA = combinations.flat()
  return combinationsA
}

const getFileCombinations = async function ({
  taskPath,
  commands,
  duration,
  cwd,
  debug,
  system,
}) {
  const combinations = await Promise.all(
    commands.map((command) =>
      getCommandCombinations({
        taskPath,
        command,
        duration,
        cwd,
        debug,
        system,
      }),
    ),
  )
  const combinationsA = combinations.flat()
  return combinationsA
}
