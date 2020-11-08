import { addPrefix } from '../prefix.js'

// Make timestamp more human-friendly.
export const prettifyTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  const body = new Date(timestamp).toLocaleString()
  const bodyA = addPrefix('Timestamp', body)
  return bodyA
}
