// Get cartesian product of all combinations
export const getCombinationsProduct = function ({
  tasks,
  runners,
  inputs,
  systemId,
}) {
  return tasks.flatMap((task) =>
    getCombinationsByTask({ task, runners, inputs, systemId }),
  )
}

const getCombinationsByTask = function ({ task, runners, inputs, systemId }) {
  const taskRunners = getTaskRunners(task, runners)
  return taskRunners.flatMap((runner) =>
    getCombinationsByRunner({ task, runner, inputs, systemId }),
  )
}

const getTaskRunners = function (task, runners) {
  return runners.filter(({ runnerId }) => runnerId === task.runnerId)
}

const getCombinationsByRunner = function ({ task, runner, inputs, systemId }) {
  return inputs.map((input) =>
    getCombinationByInput({ task, runner, input, systemId }),
  )
}

const getCombinationByInput = function ({
  task: { taskId, taskPath },
  runner: {
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
  },
  input: { inputId, inputValue },
  systemId,
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
    inputId,
    inputValue,
    systemId,
  }
}
