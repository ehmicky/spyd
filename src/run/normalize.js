// Normalize the result after measuring
export const normalizeMeasuredResult = function (result) {
  const combinations = result.combinations.map(normalizeCombination)
  return { ...result, combinations }
}

const normalizeCombination = function ({
  dimensions: {
    task: { taskId },
    runner: { runnerId },
    system: { systemId },
  },
  stats,
}) {
  return {
    dimensions: {
      task: { taskId },
      runner: { runnerId },
      system: { systemId },
    },
    stats,
  }
}
