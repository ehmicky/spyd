import ajvErrors from 'ajv-errors'
import ajvFormats from 'ajv-formats'
import ajvKeywords from 'ajv-keywords'
import Ajv from 'ajv/dist/2020.js'
import { decodePointer } from 'json-ptr'

import { wrapError } from '../../../../../error/wrap.js'

const main = async function (definition, input) {
  const validate = compileSchema(definition)

  if (!validate(input)) {
    await throwValidationError(validate.errors)
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

const compileSchema = function (schema) {
  try {
    return AJV.compile(schema)
  } catch (error) {
    throw wrapError(
      error,
      '"schema" value is invalid JSON schema (version 2020).\n',
    )
  }
}

const throwValidationError = function (errors) {
  // eslint-disable-next-line fp/no-mutating-methods
  const message = [...errors].reverse().map(serializeAjvError).join(', ')
  const messageA = message.startsWith('must')
    ? `${message}.`
    : `must be valid: ${message}.`
  throw new Error(messageA)
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
  main,
}
