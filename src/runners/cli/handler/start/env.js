import decamelize from 'decamelize'

import { mapValues, mapKeys } from '../../../../utils/map.js'

// Inputs are passed as environment variables.
// For example, input `thisExample` would be `SPYD_INPUTS_THIS_EXAMPLE`.
// Any non-string JSON value is serialized.
export const getEnv = function (inputs) {
  const inputsA = mapValues(inputs, serializeEnvVar)
  const inputsB = mapKeys(inputsA, normalizeEnvVarName)
  return inputsB
}

const serializeEnvVar = function (inputValue) {
  return typeof inputValue === 'string'
    ? inputValue
    : JSON.stringify(inputValue)
}

const normalizeEnvVarName = function (inputId) {
  const inputIdA = decamelize(inputId).toUpperCase()
  return `${ENV_PREFIX}${inputIdA}`
}

const ENV_PREFIX = 'SPYD_INPUTS_'
