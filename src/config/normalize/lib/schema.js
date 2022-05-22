import ajvFormats from 'ajv-formats'
import ajvKeywords from 'ajv-keywords'
import Ajv from 'ajv/dist/2020.js'
import { decodePointer } from 'json-ptr'

import { wrapError } from '../../../error/wrap.js'

import { callValueFunc } from './call.js'

// Apply `schema[(value, opts)]` which throws on JSON schema validation errors
export const validateSchema = async function (value, schema, opts) {
  if (schema === undefined) {
    return
  }

  const schemaA = await callValueFunc(schema, value, opts)
  const validate = compileSchema(schemaA)

  if (!validate(value)) {
    await callValueFunc(
      throwValidationError.bind(undefined, validate),
      value,
      opts,
    )
  }
}

const getAjv = function () {
  const ajvInstance = new Ajv(AJV_OPTIONS)
  ajvFormats(ajvInstance)
  ajvKeywords(ajvInstance)
  return ajvInstance
}

const AJV_OPTIONS = {
  strict: true,
  logger: false,
  $data: true,
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

const throwValidationError = function ({
  errors: [{ instancePath, message }],
}) {
  const propPath = decodePointer(instancePath).join('.')
  const propPathA = propPath === '' ? propPath : `${propPath} `
  const messageA = `${propPathA}${message}.`
  const messageB = messageA.startsWith('must')
    ? messageA
    : `must be valid: ${messageA}`
  throw new Error(messageB)
}
