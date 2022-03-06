import { OTHER_TOKEN_TYPES, getOtherStringTokenType } from './other.js'
import { PROP_TOKEN } from './prop.js'

// Retrieve the type of a given token parsed object
export const getObjectTokenType = function (token) {
  return TOKEN_TYPES.find((tokenType) => tokenType.testObject(token))
}

// Order is significant as they are tested serially
const TOKEN_TYPES = [...OTHER_TOKEN_TYPES, PROP_TOKEN]

// Retrieve the type of a given token serialized string
export const getStringTokenType = function (chars, isProp) {
  if (isProp) {
    return PROP_TOKEN
  }

  const tokenType = getOtherStringTokenType(chars)
  return tokenType === undefined ? PROP_TOKEN : tokenType
}
