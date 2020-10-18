// Select iterations according to sets of identifiers (targets)
export const applyTargets = function (
  { iterations, ...rawBenchmark },
  targets,
) {
  const iterationsA = iterations.filter((iteration) =>
    matchTargets(iteration, targets),
  )
  return { ...rawBenchmark, iterations: iterationsA }
}

const matchTargets = function (iteration, targets) {
  return targets.every(({ idName, ids }) => matchTarget(iteration[idName], ids))
}

const matchTarget = function (id, ids) {
  if (ids.length === 0) {
    return false
  }

  const allowedIds = ids.filter(({ deny }) => !deny)

  if (allowedIds.length !== 0) {
    return allowedIds.some(({ id: idA }) => idA === id)
  }

  return !ids.some(({ id: idA }) => idA === id)
}
