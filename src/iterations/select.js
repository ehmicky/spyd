// Select tasks according to the `tasks` and `variations` options (if specified)
export const selectIterations = function({
  iterations: allIterations,
  taskIds,
  variationIds,
}) {
  const iterations = selectIds({
    iterations: allIterations,
    allIterations,
    ids: taskIds,
    propName: 'taskId',
    name: 'task',
  })
  const iterationsA = selectIds({
    iterations,
    allIterations,
    ids: variationIds,
    propName: 'variationId',
    name: 'variation',
  })
  return iterationsA
}

const selectIds = function({ iterations, allIterations, ids, propName, name }) {
  if (ids === undefined) {
    return iterations
  }

  ids.forEach(id => validateId({ allIterations, id, propName, name }))

  return iterations.filter(iteration =>
    isSelected({ iteration, ids, propName }),
  )
}

const validateId = function({ allIterations, id, propName, name }) {
  if (!hasId({ allIterations, id, propName })) {
    throw new Error(`Selected ${name} '${id}' but that ${name} does not exist`)
  }
}

const hasId = function({ allIterations, id, propName }) {
  return allIterations.some(iteration => iteration[propName] === id)
}

const isSelected = function({ iteration, ids, propName }) {
  return ids.some(id => id === iteration[propName])
}
