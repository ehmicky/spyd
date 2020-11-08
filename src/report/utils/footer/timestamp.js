// Make timestamp more human-friendly.
export const getTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  const timestampStr = new Date(timestamp).toLocaleString()
  return { Timestamp: timestampStr }
}
