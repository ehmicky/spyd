import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { CORE_PROPS_SET } from '../../rule.js'
import { BUILTIN_KEYWORDS } from '../list/main.js'

// Validate `keyword.name` and `keyword.aliases[*]`
export const validateName = function (name, parent, prefix) {
  if (name === undefined) {
    throw new TypeError(`${prefix} must be defined: ${inspect(parent)}`)
  }

  if (!isValidName(name)) {
    throw new TypeError(`${prefix} must be a non-empty string: ${name}`)
  }

  if (!NAME_REGEXP.test(name)) {
    throw new TypeError(
      `${prefix} must only contain lowercase letters: "${name}"`,
    )
  }
}

const isValidName = function (nameOrAlias) {
  return typeof nameOrAlias === 'string' && nameOrAlias !== ''
}

// Keyword names must be lowercase letters.
// This ensures npm package name matches the property name.
const NAME_REGEXP = /^[a-z]+$/u

// Do not allow redefining builtin keywords
export const validateNotBuiltin = function ({ name }) {
  if (BUILTIN_NAMES.has(name)) {
    throw new TypeError('must not be a builtin keyword.')
  }

  if (CORE_PROPS_SET.has(name)) {
    throw new TypeError('must not be a core property.')
  }
}

const getBuiltinNames = function () {
  return new Set(BUILTIN_KEYWORDS.map(getKeywordName))
}

const getKeywordName = function ({ name }) {
  return name
}

const BUILTIN_NAMES = getBuiltinNames()

// Do not allow defining the same custom keyword twice, as it would make
// configuring them ambiguous.
// Custom keywords may export a function returning different `keyword.name`
// based on options though.
export const validateDuplicateKeyword = function (keywordA, indexA, keywords) {
  const isDuplicate = keywords.some(
    (keywordB, indexB) =>
      indexA < indexB &&
      isPlainObj(keywordB) &&
      keywordA.name === keywordB.name,
  )

  if (isDuplicate) {
    throw new TypeError('must not be passed twice.')
  }
}
