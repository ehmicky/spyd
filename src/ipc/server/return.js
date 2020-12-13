export const handleReturnValue = function (
  { state: { measures } },
  { taskTitle, measure },
) {
  if (taskTitle !== undefined) {
    return { taskTitle }
  }

  const measuresA = [...measures, measure]
  return { measures: measuresA }
}
