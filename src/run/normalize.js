// Normalize the result after measuring
export const normalizeMeasuredResult = function (result) {
  const combinations = result.combinations.map(normalizeCombination)
  return { ...result, combinations }
}

const normalizeCombination = function ({
  dimensions: {
    task: { id: taskId },
    runner: { id: runnerId },
    system: { id: systemId },
  },
  stats,
}) {
  return {
    dimensions: {
      task: { id: taskId },
      runner: { id: runnerId },
      system: { id: systemId },
    },
    stats,
  }
}
