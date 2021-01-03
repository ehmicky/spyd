// Get cartesian product of all combinations
export const getCombinationsProduct = function ({
  tasks,
  runners,
  inputs,
  systemId,
}) {
  return tasks
    .flatMap((task) => getCombinationsByTask({ task, runners }))
    .map((combination) => ({ ...combination, inputs, systemId }))
}

const getCombinationsByTask = function ({ task, runners }) {
  const taskRunners = getTaskRunners({ task, runners })
  return taskRunners.flatMap((runner) =>
    getCombinationByRunner({ task, runner }),
  )
}

const getTaskRunners = function ({ task, runners }) {
  return runners.filter(({ runnerId }) => runnerId === task.runnerId)
}

const getCombinationByRunner = function ({
  task: { taskId, taskPath },
  runner: {
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
  },
}) {
  return {
    taskPath,
    taskId,
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
  }
}
