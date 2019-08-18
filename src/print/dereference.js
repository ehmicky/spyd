// Dereference task/variation/command/env indexes
export const dereferenceBenchmark = function(
  iterations,
  { tasks, variations, commands, envs },
) {
  return iterations.map(iteration =>
    dereferenceIteration({ iteration, tasks, variations, commands, envs }),
  )
}

const dereferenceIteration = function({
  iteration: { task, variation, command, env, ...iteration },
  tasks,
  variations,
  commands,
  envs,
}) {
  const taskA = { ...tasks[task], rank: task }
  const variationA =
    variation === undefined ? {} : { ...variations[variation], rank: variation }
  const commandA = { ...commands[command], rank: command }
  const envA = { ...envs[env], rank: env }
  return {
    ...iteration,
    task: taskA,
    variation: variationA,
    command: commandA,
    env: envA,
  }
}
