// Make timestamp more human-friendly.
// Must be done at end since `previous` must use raw timestamps.
export const prettifyTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return ''
  }

  return new Date(timestamp).toLocaleString()
}
