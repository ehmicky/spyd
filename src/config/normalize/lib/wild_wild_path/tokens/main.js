import { ANY_TOKEN } from './any.js'
import { ARRAY_TOKEN } from './array.js'
import { PROP_TOKEN } from './prop.js'
import { REGEXP_TOKEN } from './regexp.js'
import { SLICE_TOKEN } from './slice.js'

// Order is significant as they are tested serially
const TOKEN_TYPES = [
  ANY_TOKEN,
  REGEXP_TOKEN,
  SLICE_TOKEN,
  ARRAY_TOKEN,
  PROP_TOKEN,
]

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
