// Get cartesian product of all combinations
export const getCombinationsProduct = function ({
  tasks,
  runners,
  inputs,
  system,
}) {
  return tasks.flatMap((task) =>
    getCombinationsByTask({ task, runners, inputs, system }),
  )
}

const getCombinationsByTask = function ({ task, runners, inputs, system }) {
  return runners.flatMap((runner) =>
    getCombinationsByRunner({ task, runner, inputs, system }),
  )
}

const getCombinationsByRunner = function ({ task, runner, inputs, system }) {
  return inputs.map((input) =>
    getCombinationByInput({ task, runner, input, system }),
  )
}

const getCombinationByInput = function ({
  task: { taskId, taskTitle, taskPath },
  runner: {
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
  },
  input: { inputId, inputTitle },
  system: { id: systemId, title: systemTitle },
}) {
  return {
    taskPath,
    taskId,
    taskTitle,
    inputId,
    inputTitle,
    runnerId,
    runnerTitle,
    runnerRepeats,
    runnerSpawn,
    runnerSpawnOptions,
    runnerVersions,
    systemId,
    systemTitle,
  }
}
