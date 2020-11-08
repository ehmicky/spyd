// Make timestamp more human-friendly.
export const prettifyTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  return new Date(timestamp).toLocaleString()
}
