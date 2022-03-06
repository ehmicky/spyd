import { OTHER_TOKEN_TYPES } from './other.js'
import { PROP_TOKEN } from './prop.js'

// Retrieve the type of a given token parsed object
export const getObjectTokenType = function (token) {
  return TOKEN_TYPES.find((tokenType) => tokenType.testObject(token))
}

// Retrieve the type of a given token serialized string
export const getStringTokenType = function (chars, isProp) {
  return isProp
    ? PROP_TOKEN
    : TOKEN_TYPES.find((tokenType) => tokenType.testString(chars))
}

// Order is significant as they are tested serially
const TOKEN_TYPES = [...OTHER_TOKEN_TYPES, PROP_TOKEN]