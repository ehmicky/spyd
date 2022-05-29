import { normalizePath, serializePath } from 'wild-wild-parser'

// `normalizePath()` might throw if `parent` contains syntax errors.
const main = function (definition, { originalPath }) {
  const originalPathA = [...normalizePath(definition), ...originalPath]
  const originalName = serializePath(originalPathA)
  return { info: { originalPath: originalPathA, originalName } }
}

// The `parent` rule is the name of the parent properties.
// It is exposed in `info.originalName|originalPath`.
// It is a dot-delimited string.
// By default, there is are none.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'parent',
  undefinedInput: true,
  main,
}
