import { inspect } from 'util'

export const validateEnum = function (value, set) {
  if (set.has(value)) {
    return
  }

  const setItems = [...set].map(inspect)
  const separator = setItems.some(hasNewline) ? '\n' : ', '
  const setItemsStr = setItems.join(separator)
  throw new Error(`must be one of: ${setItemsStr}.`)
}

const hasNewline = function (string) {
  return string.includes('\n')
}
