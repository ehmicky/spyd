// Add `bugs` URL on `PluginError`
export const handlePluginError = function ({
  error,
  bugs,
  PluginError,
  AnyError,
}) {
  return error instanceof PluginError && typeof bugs === 'string' && bugs !== ''
    ? new AnyError('', { cause: error, bugs })
    : error
}
