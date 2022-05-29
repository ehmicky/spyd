import { normalizeQuery, serializeQuery } from 'wild-wild-parser'
import { get } from 'wild-wild-path'

import { wrapError } from '../../../error/wrap.js'

// Validate and normalize rules.
// All methods and properties that use queries can use either the string or the
// path syntax.
export const normalizeRules = function (rules, all) {
  return rules.map((rule) => normalizeRule(rule, all))
}

const normalizeRule = function ({ name, ...rule }, all) {
  const namePath = getNamePath(name)
  const nameQuery = serializeQuery(namePath)
  const defaultRule = {
    required: defaultRequired,
    example: rule.default,
    ...all,
  }
  return { ...defaultRule, ...rule, nameQuery, namePath }
}

// `required` defaults to `false` except for array items.
// This validates against sparse arrays by default, since they are usually
// unwanted.
const defaultRequired = function ({ path, config }) {
  return path.length !== 0 && Array.isArray(get(config, path.slice(0, -1)))
}

const getNamePath = function (name) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    throw wrapError(error, 'Invalid "name":')
  }
}
