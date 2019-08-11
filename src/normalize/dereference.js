// Dereference task/variation/command indexes
export const dereferenceBenchmark = function({
  benchmark: { tasks, variations, commands },
  iterations,
}) {
  return iterations.map(iteration =>
    dereferenceIteration({ iteration, tasks, variations, commands }),
  )
}

const dereferenceIteration = function({
  iteration: { task, variation, command, ...iteration },
  tasks,
  variations,
  commands,
}) {
  const taskA = tasks[task]
  const variationA = variation === undefined ? {} : variations[variation]
  const commandA = commands[command]
  return { ...iteration, task: taskA, variation: variationA, command: commandA }
}
