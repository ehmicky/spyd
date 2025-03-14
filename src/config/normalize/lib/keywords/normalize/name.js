import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'

import { DefinitionError, KeywordError } from '../../error.js'
import { CORE_PROPS_SET } from '../../rule/props.js'
import { BUILTIN_KEYWORDS } from '../list/main.js'

// Validate `keyword.name` and `keyword.aliases[*]`
export const validateName = (name, parent, prefix) => {
  if (name === undefined) {
    throw new KeywordError(`${prefix} must be defined: ${inspect(parent)}`)
  }

  if (!isValidName(name)) {
    throw new KeywordError(`${prefix} must be a non-empty string: ${name}`)
  }

  if (!NAME_REGEXP.test(name)) {
    throw new KeywordError(
      `${prefix} must only contain lowercase letters: "${name}"`,
    )
  }
}

const isValidName = (nameOrAlias) =>
  typeof nameOrAlias === 'string' && nameOrAlias !== ''

// Keyword names must be lowercase letters.
// This ensures npm package name matches the property name.
const NAME_REGEXP = /^[a-z]+$/u

// Do not allow redefining builtin keywords
export const validateNotBuiltin = ({ name }) => {
  if (BUILTIN_NAMES.has(name)) {
    throw new DefinitionError('must not be a builtin keyword.')
  }

  if (CORE_PROPS_SET.has(name)) {
    throw new KeywordError('must not be a core property.')
  }
}

const getBuiltinNames = () => new Set(BUILTIN_KEYWORDS.map(getKeywordName))

const getKeywordName = ({ name }) => name

const BUILTIN_NAMES = getBuiltinNames()

// Do not allow defining the same custom keyword twice, as it would make
// configuring them ambiguous.
// Custom keywords may export a function returning different `keyword.name`
// based on options though.
export const validateDuplicateKeyword = (keywordA, indexA, keywords) => {
  const isDuplicate = keywords.some(
    (keywordB, indexB) =>
      indexA < indexB &&
      isPlainObj(keywordB) &&
      keywordA.name === keywordB.name,
  )

  if (isDuplicate) {
    throw new DefinitionError('must not be passed twice.')
  }
}
