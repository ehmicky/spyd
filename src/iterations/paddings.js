// Make `taskTitle` and `variationTitle` reporter-friendly by adding paddings.
// Also add `iteration.name` which combines `taskTitle` and `variationTitle`.
export const addPaddings = function(iterations) {
  const paddings = getPaddings(iterations)
  const iterationsA = iterations.map(iteration =>
    addPadding(iteration, paddings),
  )
  return iterationsA
}

// Vertically align both `taskTitle` and `variationTitle`
const getPaddings = function(iterations) {
  const task = getPadding(iterations, 'taskTitle')
  const variation = getPadding(iterations, 'variationTitle')
  return { task, variation }
}

const getPadding = function(iterations, propName) {
  const lengths = iterations.map(({ [propName]: value = '' }) => value.length)
  return Math.max(...lengths)
}

const addPadding = function(
  { taskTitle, variationTitle, ...iteration },
  paddings,
) {
  const taskTitleA = taskTitle.padEnd(paddings.task)

  if (variationTitle === undefined) {
    const name = taskTitleA.padEnd(paddings.variation + 3)
    return { ...iteration, taskTitle: taskTitleA, name }
  }

  const variationTitleA = variationTitle.padEnd(paddings.variation)
  const nameA = `${taskTitleA} | ${variationTitleA}`
  return {
    ...iteration,
    taskTitle: taskTitleA,
    variationTitle: variationTitleA,
    name: nameA,
  }
}
