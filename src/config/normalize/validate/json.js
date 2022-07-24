import isJsonValue from 'is-json-value'

// Validate that a value is JSON-compatible
export const validateJson = function (value) {
  const warnings = isJsonValue(value)

  if (warnings.length !== 0) {
    const [{ message }] = warnings
    throw new Error(`must be valid JSON.\n${message}`)
  }
}
