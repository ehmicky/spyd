import decamelize from 'decamelize'
import mapObj from 'map-obj'

// Inputs are passed as environment variables.
// For example, input `thisExample` would be `SPYD_INPUTS_THIS_EXAMPLE`.
// Any non-string JSON value is serialized.
export const getEnv = function (inputs) {
  return mapObj(inputs, getEnvVar)
}

const getEnvVar = function (inputId, inputValue) {
  const inputIdA = decamelize(inputId).toUpperCase()
  const name = `${ENV_PREFIX}${inputIdA}`
  const value =
    typeof inputValue === 'string' ? inputValue : JSON.stringify(inputValue)
  return [name, value]
}

const ENV_PREFIX = 'SPYD_INPUTS_'
