import modernErrors from 'modern-errors'

import { packageJson } from '../../../utils/package.js'

const unknownErrorBugsUrl = packageJson.bugs.url

export const createErrorTypes = function ({ bugsUrl, ...opts }) {
  const {
    // Error from the library's user, who defines available plugin types
    UserError,
    // Error from a plugin author, who defines a specific plugin
    PluginError,
    // Error from a plugin user
    ConsumerError,
    errorHandler,
  } = modernErrors(['UserError', 'PluginError', 'ConsumerError'], {
    bugsUrl: getBugsUrl.bind(undefined, bugsUrl),
  })
  return { ...opts, UserError, PluginError, ConsumerError, errorHandler }
}

const getBugsUrl = function ({ name }, userErrorBugUrl) {
  if (name === 'UnknownError') {
    return unknownErrorBugsUrl
  }

  if (name === 'UserError') {
    return userErrorBugUrl
  }

  if (name === 'PluginError') {
    return ''
  }
}
