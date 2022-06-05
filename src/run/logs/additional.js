// Adds an additional error message based on some common errors that can be
// detected from the tasks logs.
// Some might be language-specific. We detect those in core instead of inside
// each runner because some runners:
//  - Might share the same language, e.g. several runners might use
//    JavaScript
//  - Call another language, e.g. the `cli` runner might call `node`
export const getAdditionalMessage = function (taskLogs) {
  const additionalMessage = ADDITIONAL_MESSAGES.find(({ includes }) =>
    taskLogs.includes(includes),
  )

  if (additionalMessage === undefined) {
    return ''
  }

  return `${additionalMessage.message}\n\n`
}

const ADDITIONAL_MESSAGES = [
  {
    includes: 'JavaScript heap out of memory',
    message:
      'The task ran out of memory. This is most likely due to a memory leak in the task.',
  },
]
