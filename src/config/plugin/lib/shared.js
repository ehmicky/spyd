import { inspect } from 'util'

import {
  serializeQuery,
  parseQuery,
  normalizeQuery,
  getTokenType,
} from 'wild-wild-parser'
import { pick } from 'wild-wild-utils'

import { UserError } from './error.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function (sharedConfig, shared) {
  const sharedPropNames = getSharedPropNames(shared)
  const sharedConfigA = pick(sharedConfig, sharedPropNames)
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

const getSharedPropNames = function (shared = []) {
  const sharedPropNames = getRuleNames(shared, [])
  const sharedPropNamesA = [
    ...new Set(sharedPropNames.map(serializeQuery)),
  ].flatMap(parseQuery)
  return sharedPropNamesA.filter(isPropRuleName)
}

const getRuleNames = function (rulesOrRule, indices) {
  const rulesOrRuleA =
    rulesOrRule instanceof Set ? [...rulesOrRule] : rulesOrRule

  return Array.isArray(rulesOrRuleA)
    ? rulesOrRuleA.flatMap((rule, index) =>
        getRuleNames(rule, [...indices, index]),
      )
    : getRuleName(rulesOrRuleA, indices)
}

// Parse and validate all `shared.*.name`
const getRuleName = function ({ name }, indices) {
  try {
    return normalizeQuery(name)
  } catch (error) {
    const indicesStr = indices.map(String).join('.')
    throw new UserError(`Invalid "shared.${indicesStr}.name": ${error.message}`)
  }
}

// Normalize plugin-specific configuration property `name`
export const normalizeRuleName = function (name) {
  const queryArrays = normalizeQuery(name)
  queryArrays.forEach(validateRuleName)
  return queryArrays
}

const validateRuleName = function (queryArray) {
  if (!isPropRuleName(queryArray)) {
    throw new UserError(
      `the first token must be a property name instead of: ${inspect(
        queryArray[0],
      )}`,
    )
  }
}

const isPropRuleName = function ([firstToken]) {
  return getTokenType(firstToken) === 'prop'
}

// Validate that plugin configuration properties do not overwrite shared ones
export const validateSharedProp = function (name, sharedPropNames) {
  const sharedPropName = findSharedProp(name, sharedPropNames)

  if (sharedPropName !== undefined) {
    const sharedQuery = serializeQuery(sharedPropName)
    throw new Error(
      `must not redefine core configuration property "${sharedQuery}".`,
    )
  }
}

const findSharedProp = function (name, sharedPropNames) {
  return sharedPropNames.find((sharedPropName) =>
    isSharedProp(name, sharedPropName),
  )
}

const isSharedProp = function (name, [sharedFirstToken]) {
  return name.some(([firstToken]) => firstToken === sharedFirstToken)
}
