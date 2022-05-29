import { inspect } from 'util'

import isPlainObj from 'is-plain-obj'

import { wrapError } from '../../../../../error/wrap.js'
import { DefinitionError } from '../../error.js'

import { validateName } from './name.js'
import { validateKeywordProps } from './props.js'

// Validate custom keywords
export const validateKeywords = function (keywords) {
  keywords.forEach(validateKeyword)
}

const validateKeyword = function (keyword, index, keywords) {
  if (!isPlainObj(keyword)) {
    throw new DefinitionError(
      `Keyword must be a plain object: ${inspect(keyword)}`,
    )
  }

  validateName(keyword.name, keyword, 'Keyword "name" property')

  try {
    validateKeywordProps(keyword, index, keywords)
  } catch (error) {
    throw wrapError(error, `Invalid keyword "${keyword.name}":`)
  }
}
