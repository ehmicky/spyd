// Start measuring a task
export const startMeasuring = function (empty) {
  const mainMeasures = []
  const emptyMeasures = empty ? [] : undefined
  return { mainMeasures, emptyMeasures }
}
