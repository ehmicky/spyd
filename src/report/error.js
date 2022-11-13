import { handlePluginError } from '../config/plugin/error.js'
import { PluginError, BaseError } from '../error/main.js'

// Create a reporter plugin error
export const getReporterPluginError = function (reporter, ...args) {
  const error = new PluginError(...args)
  return handlePluginError({
    error,
    bugs: reporter.bugs,
    PluginError,
    BaseError,
  })
}
