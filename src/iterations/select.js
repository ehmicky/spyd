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

  if (ids.length === 0) {
    return []
  }

  const idsA = ids.map(normalizeId)

  idsA.forEach(({ id }) => validateId({ allIterations, id, propName, name }))

  return iterations.filter(iteration =>
    isSelected({ iteration, ids: idsA, propName }),
  )
}

// Ids can start with ! to blacklist instead of whitelist
// Whitelisting has priority over blacklisting
const normalizeId = function(id) {
  const blacklist = id.startsWith('!')
  const idA = blacklist ? id.slice(1) : id
  return { id: idA, blacklist }
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
  const whitelistIds = ids.filter(({ blacklist }) => !blacklist)

  if (whitelistIds.length !== 0) {
    return whitelistIds.some(({ id }) => id === iteration[propName])
  }

  return !ids.some(({ id }) => id === iteration[propName])
}
