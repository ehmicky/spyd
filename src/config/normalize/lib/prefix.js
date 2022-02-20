import { wrapError } from '../../../error/wrap.js'

// Prepend `prefix` and `parents` options to error message.
// Also surround property name with quotes.
export const addPropPrefix = function (
  error,
  { prefix, parents, funcOpts: { name } },
) {
  const prefixA = getPrefix(prefix)
  const parentsA = getParents(parents)
  const dot = getDot(parentsA, name)
  const colon = getColon(error)
  const propName = `${prefixA} "${parentsA}${dot}${name}"${colon}`
  return wrapError(error, propName)
}

// The `prefix` option is the name of the type of property to show in error
// message such as "Option".
// It can be `undefined` when an error was thrown inside `prefix()` itself.
const getPrefix = function (prefix = DEFAULT_PREFIX) {
  return prefix.trim()
}

const DEFAULT_PREFIX = 'Option'

// The `parents` option are the names of the parent properties, to show in
// error messages.
// It is a dot-delimited string optionally ending with `.`
// By default, there are none.
// It can be `undefined` when an error was thrown inside `parents()` itself.
const getParents = function (parents = DEFAULT_PARENTS) {
  const parentsB = String(parents)
  return parentsB.endsWith('.') ? parentsB.slice(0, -1) : parentsB
}

const DEFAULT_PARENTS = ''

const getDot = function (parents, name) {
  return name !== '' && parents !== '' ? '.' : ''
}

const getColon = function (error) {
  return error.validation ? '' : ':'
}
