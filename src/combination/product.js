// Get cartesian product of all combinations
// The order of the `runners` configuration property is preserved so it can
// be used when merging `runnerVersions`.
export const getCombinationsProduct = function ({
  runners,
  tasks,
  inputs,
  systemId,
}) {
  return runners
    .flatMap((runner) => getCombinationsByRunner(runner, tasks))
    .map((combination) => ({ ...combination, inputs, systemId }))
}

const getCombinationsByRunner = function (runner, tasks) {
  return tasks
    .filter(({ runnerId }) => runnerId === runner.runnerId)
    .map((task) => getCombinationByTask(runner, task))
}

const getCombinationByTask = function (
  { runnerId, runnerSpawn, runnerSpawnOptions, runnerConfig },
  { taskId, taskPath },
) {
  return {
    taskPath,
    taskId,
    runnerId,
    runnerSpawn,
    runnerSpawnOptions,
    runnerConfig,
  }
}
