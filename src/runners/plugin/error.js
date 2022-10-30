import { AnyError, PluginError } from '../../error/main.js'

// Add runner `bugs` URL on runner `PluginError`
export const handleRunnerError = function (error, runner) {
  return error instanceof PluginError
    ? new AnyError('', { cause: error, bugs: runner.bugs })
    : error
}
