import now from 'precise-now'

// Retrieve `percentage` and `durationLeft` to show in preview.
// Those are also passed to `reporters` in preview:
//  - This is meant for reporters not printed in terminal.
//  - This is not passed to the final report.
//  - Unlike the progress bar, there is a slight delay since those properties
//    require another call to `setPreviewReport()`. This delay is roughly equal
//    to the duration between two `setPreviewReport()`.
// `combinationStart` is undefined on the first preview.
// `combinationEnd` is undefined when a combination has started but has not
// computed its estimated end yet.
export const updateCompletion = (previewState) => {
  const { durationLeft, percentage } = getCompletionProps(previewState)
  // eslint-disable-next-line fp/no-mutating-assign
  Object.assign(previewState, { durationLeft, percentage })
}

const getCompletionProps = ({
  combinationStart,
  combinationEnd,
  index,
  total,
}) => {
  const completePercentage = index / total

  if (combinationStart === undefined || combinationEnd === undefined) {
    return { durationLeft: EMPTY_DURATION_LEFT, percentage: completePercentage }
  }

  const durationLeftNumber = Math.max(combinationEnd - now(), 0)
  const durationLeft = getDurationLeft(durationLeftNumber)

  const combinationDuration = combinationEnd - combinationStart
  const partialPercentage =
    (1 - durationLeftNumber / combinationDuration) / total
  const percentage = completePercentage + partialPercentage
  return { durationLeft, percentage }
}

export const EMPTY_DURATION_LEFT = '--:--'

// Retrieve seconds/minutes/hours left in a human-friendly string
const getDurationLeft = (nsecs) => {
  const secs = Math.ceil(nsecs / NANOSECS_TO_SECS)
  const minutes = Math.floor(secs / SECS_TO_MINUTES)
  const secsA = secs - minutes * SECS_TO_MINUTES
  const hours = Math.floor(minutes / MINUTES_TO_HOURS)
  const minutesA = minutes - hours * MINUTES_TO_HOURS

  const hoursStr = hours === 0 ? '' : `${padDuration(hours)}:`
  return `${hoursStr}${padDuration(minutesA)}:${padDuration(secsA)}`
}

const NANOSECS_TO_SECS = 1e9
const SECS_TO_MINUTES = 60
const MINUTES_TO_HOURS = 60

const padDuration = (duration) => String(duration).padStart(2, '0')
