import { stderr } from 'process'

import isInteractive from 'is-interactive'

import { PROGRESS_REPORTERS } from './reporters/main.js'

// Retrieve reporters methods
export const getReporters = function(progressReporters) {
  if (!isInteractive(stderr)) {
    return [PROGRESS_REPORTERS.silent]
  }

  return progressReporters.map(getReporter)
}

// Retrieve reporter's main function
const getReporter = function(reporterName) {
  if (PROGRESS_REPORTERS[reporterName] !== undefined) {
    return PROGRESS_REPORTERS[reporterName]
  }

  try {
    // TODO: replace with `import()` once it is supported by default by ESLint
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(reporterName)
  } catch (error) {
    throw new Error(
      `Could not load progress reporter '${reporterName}'\n\n${error.stack}`,
    )
  }
}
