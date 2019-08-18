// When two `files` define the same iteration, the last one prevails.
// Also used when merging benchmarks of the same job.
export const removeDuplicates = function(iterations) {
  return iterations.filter(removeDuplicate)
}

const removeDuplicate = function(
  { taskId, variationId, commandId, envId },
  index,
  iterations,
) {
  return iterations
    .slice(index + 1)
    .every(
      iteration =>
        iteration.taskId !== taskId ||
        iteration.variationId !== variationId ||
        iteration.commandId !== commandId ||
        iteration.envId !== envId,
    )
}
