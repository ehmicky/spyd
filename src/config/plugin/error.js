// Add `bugs` URL on `PluginError`
export const handlePluginError = ({ error, bugs, PluginError, BaseError }) =>
  error instanceof PluginError && typeof bugs === 'string'
    ? new BaseError('', { cause: error, bugs })
    : error
