import { normalizeError } from '../../../error/utils.js'
import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

// Append `prefix` option to error message.
// The space at the end of `prefix` is optional.
// If `prefix` ends with `.`:
//  - The default prefix is prepended.
//  - No space is appended.
// Also surround property name with quotes.
export const addPropPrefix = async function (
  error,
  { prefix, funcOpts, funcOpts: { name } },
) {
  const prefixA = await getPrefix(prefix, funcOpts)
  const propName = `${prefixA}${name}`
  const propNameA = quotePropName(propName)
  const propNameB = appendColon(propNameA, error)
  return wrapError(error, propNameB)
}

const getPrefix = async function (prefix, funcOpts) {
  const prefixA = await callPrefix(prefix, funcOpts)

  if (prefixA === undefined) {
    return `${DEFAULT_PREFIX} `
  }

  const prefixB = String(prefixA)

  if (prefixB.endsWith('.')) {
    return `${DEFAULT_PREFIX} ${prefixB}`
  }

  return shouldAppendSpace(prefixB) ? `${prefixB} ` : prefixB
}

const callPrefix = async function (prefix, funcOpts) {
  try {
    return await maybeFunction(prefix, funcOpts)
  } catch (error) {
    const { message } = normalizeError(error)
    return `${message}\n`
  }
}

// Default value for the `prefix` option
export const DEFAULT_PREFIX = 'Configuration property'

const shouldAppendSpace = function (prefix) {
  return prefix !== '' && !prefix.endsWith(' ')
}

const quotePropName = function (propName) {
  const lastSpaceIndex = propName.lastIndexOf(' ')
  const [firstWords, lastWord] =
    lastSpaceIndex === -1
      ? ['', propName]
      : [
          propName.slice(0, lastSpaceIndex + 1),
          propName.slice(lastSpaceIndex + 1),
        ]
  return `${firstWords}"${lastWord}"`
}

const appendColon = function (propName, error) {
  return error.validation ? propName : `${propName}:`
}
