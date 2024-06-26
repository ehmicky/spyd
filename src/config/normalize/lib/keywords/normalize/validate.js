import { inspect } from 'node:util'

import isPlainObj from 'is-plain-obj'

import { BaseError, DefinitionError } from '../../error.js'

import { validateName } from './name.js'
import { validateKeywordProps } from './props.js'

// Validate custom keywords
export const validateKeywords = (keywords) => {
  keywords.forEach(validateKeyword)
}

const validateKeyword = (keyword, index, keywords) => {
  if (!isPlainObj(keyword)) {
    throw new DefinitionError(
      `Keyword must be a plain object: ${inspect(keyword)}`,
    )
  }

  validateName(keyword.name, keyword, 'Keyword "name" property')

  try {
    validateKeywordProps(keyword, index, keywords)
  } catch (cause) {
    throw new BaseError(`Invalid keyword "${keyword.name}":`, { cause })
  }
}
