import { inspect } from 'util'

import { serializeQuery, normalizeQuery, getTokenType } from 'wild-wild-parser'
import { pick } from 'wild-wild-utils'

import { UserError } from './error.js'

// Retrieve top-level properties that are shared with all plugins of a specific
// type. Those are merged with plugin-specific properties.
export const getSharedConfig = function (sharedConfig, shared = []) {
  const sharedPropNames = [...new Set(shared.flatMap(getRuleName))]
  const sharedConfigA = pick(sharedConfig, sharedPropNames)
  return { sharedConfig: sharedConfigA, sharedPropNames }
}

// Parse and validate all `shared.*.name`
const getRuleName = function ({ name }, index) {
  try {
    return normalizeRuleName(name)
  } catch (error) {
    throw new UserError(`Invalid "shared[${index}].name": ${error.message}`)
  }
}

export const normalizeRuleName = function (name) {
  const queryArrays = normalizeQuery(name)
  queryArrays.forEach(validateRuleName)
  return queryArrays
}

const validateRuleName = function ([firstToken]) {
  if (getTokenType(firstToken) !== 'prop') {
    throw new UserError(
      `the first token must be a property name instead of: ${inspect(
        firstToken,
      )}`,
    )
  }
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
