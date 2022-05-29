import { inspect } from 'util'

import {
  validateName,
  validateNotBuiltin,
  validateDuplicateKeyword,
} from './name.js'

// Validate each `keyword.*` property
export const validateKeywordProps = function (keyword, index, keywords) {
  validateRequiredProps(keyword)
  validateAliases(keyword)
  validateFunctions(keyword)
  validateBooleans(keyword)
  validateProps(keyword)
  validateNotBuiltin(keyword)
  validateDuplicateKeyword(keyword, index, keywords)
}

const validateRequiredProps = function (keyword) {
  REQUIRED_PROPS.forEach((propName) => {
    validateKeywordProp(keyword, propName)
  })
}

const REQUIRED_PROPS = ['main']

const validateKeywordProp = function (keyword, propName) {
  if (keyword[propName] === undefined) {
    throw new TypeError(`"${propName}" must be defined.`)
  }
}

const validateAliases = function ({ aliases }) {
  if (aliases === undefined) {
    return
  }

  if (!Array.isArray(aliases)) {
    throw new TypeError('"aliases" property must be an array.')
  }

  aliases.forEach((alias) => {
    validateName(alias, aliases, '"aliases" property')
  })
}

const validateFunctions = function (keyword) {
  FUNCTION_PROPS.forEach((propName) => {
    validateOptionalProp(keyword, propName, 'function')
  })
}

const FUNCTION_PROPS = ['test', 'normalize', 'main']

const validateBooleans = function (keyword) {
  BOOLEAN_PROPS.forEach((propName) => {
    validateOptionalProp(keyword, propName, 'boolean')
  })
}

const BOOLEAN_PROPS = ['hasInput', 'undefinedInput', 'undefinedDefinition']

const validateOptionalProp = function (keyword, propName, typeName) {
  const value = keyword[propName]

  // eslint-disable-next-line valid-typeof
  if (value !== undefined && typeof value !== typeName) {
    throw new TypeError(
      `"${propName}" property must be a ${typeName}: ${inspect(value)}`,
    )
  }
}

const validateProps = function (keywords) {
  Object.keys(keywords).forEach(validateProp)
}

const validateProp = function (propName) {
  if (!VALID_PROPS.has(propName)) {
    const propNames = [...VALID_PROPS].join(', ')
    throw new TypeError(
      `"${propName}" property must be one of the following instead:\n${propNames}`,
    )
  }
}

const VALID_PROPS = new Set([
  'name',
  'aliases',
  'exampleDefinition',
  ...FUNCTION_PROPS,
  ...BOOLEAN_PROPS,
])
