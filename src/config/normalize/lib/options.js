import { inspect } from 'node:util'

import { excludeKeys } from 'filter-obj'
import isPlainObj from 'is-plain-obj'

import { DefinitionError } from './error.js'
import { normalizeKeywords } from './keywords/normalize/main.js'
import { getRuleProps } from './rule/props.js'
import { validateRuleProps } from './rule/validate.js'

// Normalize `options`
export const normalizeOpts = (options = {}) => {
  if (!isPlainObj(options)) {
    throw new DefinitionError(
      `Options must be a plain object: ${inspect(options)}`,
    )
  }

  const { soft = false, all, keywords } = options
  const sync = false
  validateSoft(soft)
  const keywordsA = normalizeKeywords(keywords, sync)
  const ruleProps = getRuleProps(keywordsA)
  const allA = normalizeAll(all, ruleProps, sync)
  return { soft, all: allA, keywords: keywordsA, ruleProps, sync }
}

const validateSoft = (soft) => {
  if (typeof soft !== 'boolean') {
    throw new DefinitionError(
      `Option "soft" must be a boolean: ${inspect(soft)}`,
    )
  }
}

const normalizeAll = (all, ruleProps, sync) => {
  if (all === undefined) {
    return
  }

  if (!isPlainObj(all)) {
    throw new DefinitionError(
      `Option "all" must be a plain object: ${inspect(all)}`,
    )
  }

  const allA = excludeKeys(all, isUndefined)
  validateRuleProps({
    definitions: allA,
    ruleProps,
    message: 'Option "all"',
    sync,
  })
  return allA
}

const isUndefined = (key, value) => value === undefined
