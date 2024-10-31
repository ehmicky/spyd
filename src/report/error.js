import { handlePluginError } from '../config/plugin/error.js'
import { BaseError, PluginError } from '../error/main.js'

// Create a reporter plugin error
export const getReporterPluginError = (reporter, ...args) => {
  const error = new PluginError(...args)
  return handlePluginError({
    error,
    bugs: reporter.bugs,
    PluginError,
    BaseError,
  })
}
