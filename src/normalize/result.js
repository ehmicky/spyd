// Normalize the result after measuring
export const normalizeMeasuredResult = function (result) {
  const combinations = result.combinations.map(normalizeCombination)
  return { ...result, combinations }
}

const normalizeCombination = function ({ taskId, runnerId, systemId, stats }) {
  return { taskId, runnerId, systemId, stats }
}
