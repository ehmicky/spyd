import ajvErrors from 'ajv-errors'
import ajvFormats from 'ajv-formats'
import ajvKeywords from 'ajv-keywords'
import Ajv from 'ajv/dist/2020.js'
import { decodePointer } from 'json-ptr'

const normalize = function (definition) {
  try {
    return AJV.compile(definition)
  } catch {
    const cause = getValidationError(AJV.errors)
    throw new Error(
      `must be a valid JSON schema (version 2020):\n${cause.message}`,
    )
  }
}

const getAjv = function () {
  const ajvInstance = new Ajv(AJV_OPTIONS)
  ajvFormats(ajvInstance)
  ajvKeywords(ajvInstance)
  ajvErrors(ajvInstance)
  return ajvInstance
}

const AJV_OPTIONS = {
  strict: true,
  logger: false,
  $data: true,
  allowUnionTypes: true,
  allErrors: true,
}

const AJV = getAjv()

const main = function (validate, input) {
  if (!validate(input)) {
    throw getValidationError(validate.errors)
  }
}

const getValidationError = function (errors) {
  // eslint-disable-next-line fp/no-mutating-methods
  const message = [...errors].reverse().map(serializeAjvError).join(', ')
  const messageA = message.startsWith('must')
    ? `${message}.`
    : `must be valid: ${message}.`
  return new Error(messageA)
}

const serializeAjvError = function ({ instancePath, message }) {
  const propPath = decodePointer(instancePath).join('.')
  const propPathA = propPath === '' ? propPath : `${propPath} `
  return `${propPathA}${message}`
}

// Apply `schema[(input, info)]` which throws on JSON schema validation errors
// eslint-disable-next-line import/no-default-export
export default {
  name: 'schema',
  hasInput: true,
  exampleDefinition: { type: 'string' },
  normalize,
  main,
}
