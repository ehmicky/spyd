// Select combinations according to sets of identifiers (targets)
export const applyTargets = function (
  { combinations, ...partialResults },
  targets,
) {
  const combinationsA = combinations.filter((combination) =>
    matchTargets(combination, targets),
  )
  return { ...partialResults, combinations: combinationsA }
}

const matchTargets = function (combination, targets) {
  return targets.every(({ idName, ids }) =>
    matchTarget(combination[idName], ids),
  )
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
