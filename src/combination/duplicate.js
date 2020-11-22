// When two `files` define the same combination, the last one prevails.
// Also used when merging benchmarks of the same mergeId.
export const removeDuplicates = function (combinations) {
  return combinations.filter(removeDuplicate)
}

const removeDuplicate = function (
  { taskId, inputId, commandId, systemId },
  index,
  combinations,
) {
  return combinations
    .slice(index + 1)
    .every(
      (combination) =>
        combination.taskId !== taskId ||
        combination.inputId !== inputId ||
        combination.commandId !== commandId ||
        combination.systemId !== systemId,
    )
}
