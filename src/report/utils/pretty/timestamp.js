import { prettifyValue } from '../prettify_value.js'

// Make timestamp more human-friendly.
export const prettifyTimestamp = function (timestamp) {
  if (timestamp === undefined) {
    return
  }

  const timestampStr = new Date(timestamp).toLocaleString()
  return prettifyValue({ Timestamp: timestampStr })
}
