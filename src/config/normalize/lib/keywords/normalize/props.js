import { inspect } from 'node:util'

import { KeywordError } from '../../error.js'

import {
  validateName,
  validateNotBuiltin,
  validateDuplicateKeyword,
} from './name.js'

// Validate each `keyword.*` property
export const validateKeywordProps = (keyword, index, keywords) => {
  validateRequiredProps(keyword)
  validateAliases(keyword)
  validateFunctions(keyword)
  validateBooleans(keyword)
  validateProps(keyword)
  validateNotBuiltin(keyword)
  validateDuplicateKeyword(keyword, index, keywords)
}

const validateRequiredProps = (keyword) => {
  REQUIRED_PROPS.forEach((propName) => {
    validateKeywordProp(keyword, propName)
  })
}

const REQUIRED_PROPS = ['main']

const validateKeywordProp = (keyword, propName) => {
  if (keyword[propName] === undefined) {
    throw new KeywordError(`"${propName}" must be defined.`)
  }
}

const validateAliases = ({ aliases }) => {
  if (aliases === undefined) {
    return
  }

  if (!Array.isArray(aliases)) {
    throw new KeywordError('"aliases" property must be an array.')
  }

  aliases.forEach((alias) => {
    validateName(alias, aliases, '"aliases" property')
  })
}

const validateFunctions = (keyword) => {
  FUNCTION_PROPS.forEach((propName) => {
    validateOptionalProp(keyword, propName, 'function')
  })
}

const FUNCTION_PROPS = [
  'test',
  'testAsync',
  'normalize',
  'normalizeAsync',
  'main',
  'mainAsync',
]

const validateBooleans = (keyword) => {
  BOOLEAN_PROPS.forEach((propName) => {
    validateOptionalProp(keyword, propName, 'boolean')
  })
}

const BOOLEAN_PROPS = ['hasInput', 'undefinedInput', 'undefinedDefinition']

const validateOptionalProp = (keyword, propName, typeName) => {
  const value = keyword[propName]

  if (value !== undefined && typeof value !== typeName) {
    throw new KeywordError(
      `"${propName}" property must be a ${typeName}: ${inspect(value)}`,
    )
  }
}

const validateProps = (keywords) => {
  Object.keys(keywords).forEach(validateProp)
}

const validateProp = (propName) => {
  if (!VALID_PROPS.has(propName)) {
    const propNames = [...VALID_PROPS].join(', ')
    throw new KeywordError(
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
