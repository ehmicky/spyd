// Dereference task/variation/command indexes
export const dereferenceBenchmark = function(
  iterations,
  { tasks, variations, commands },
) {
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
  const taskA = { ...tasks[task], rank: task }
  const variationA =
    variation === undefined ? {} : { ...variations[variation], rank: variation }
  const commandA = { ...commands[command], rank: command }
  return { ...iteration, task: taskA, variation: variationA, command: commandA }
}
