// Add `bugs` URL on `PluginError`
export const handlePluginError = function ({
  error,
  bugs,
  PluginError,
  BaseError,
}) {
  return error instanceof PluginError && typeof bugs === 'string'
    ? new BaseError('', { cause: error, bugs })
    : error
}
