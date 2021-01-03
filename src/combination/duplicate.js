// When two `files` define the same combination, the last one prevails.
// Also used when merging results of the same mergeId.
export const removeDuplicates = function (combinations) {
  return combinations.filter(removeDuplicate)
}

const removeDuplicate = function (
  { taskId, inputId, runnerId, systemId },
  index,
  combinations,
) {
  return combinations
    .slice(index + 1)
    .every(
      (combination) =>
        combination.taskId !== taskId ||
        combination.inputId !== inputId ||
        combination.runnerId !== runnerId ||
        combination.systemId !== systemId,
    )
}
