// When two `files` define the same iteration, the last one prevails.
// Also used when merging benchmarks of the same group.
export const removeDuplicates = function (iterations) {
  return iterations.filter(removeDuplicate)
}

const removeDuplicate = function (
  { taskId, variationId, commandId, systemId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      (iteration) =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.commandId !== commandId ||
        iteration.systemId !== systemId,
    )
}
