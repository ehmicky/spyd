import { isRecurseObject } from './recurse.js'

// Properties shared by all token types which apply on objects
export const objectProps = {
  isMissing(value) {
    return !isRecurseObject(value)
  },
  defaultValue: {},
}

// Properties shared by all token types which apply on arrays
export const arrayProps = {
  isMissing(value) {
    return !Array.isArray(value)
  },
  defaultValue: [],
}
