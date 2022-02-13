import { normalizeError } from '../../../error/utils.js'
import { wrapError } from '../../../error/wrap.js'
import { maybeFunction } from '../../../utils/function.js'

// Append `prefix` option to error message.
// The space at the end of `prefix` is optional.
// If `prefix` ends with `.`:
//  - The default prefix is prepended.
//  - No space is appended.
// Also surround property name with quotes.
export const addPropPrefix = async function (error, opts) {
  const prefix = await getPrefix(opts)
  const propName = `${prefix}${opts.name}`
  const propNameA = quotePropName(propName)
  return wrapError(error, propNameA)
}

const getPrefix = async function (opts) {
  const prefix = await callPrefix(opts)

  if (prefix === undefined) {
    return `${DEFAULT_PREFIX} `
  }

  const prefixA = String(prefix)

  if (prefixA.endsWith('.')) {
    return `${DEFAULT_PREFIX} ${prefixA}`
  }

  return shouldAppendSpace(prefixA) ? `${prefixA} ` : prefixA
}

const callPrefix = async function ({ prefix, ...opts }) {
  try {
    return await maybeFunction(prefix, opts)
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
