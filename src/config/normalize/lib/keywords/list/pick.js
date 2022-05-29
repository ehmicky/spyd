import { normalizeBoolean } from '../normalize/common.js'

const main = function (definition) {
  return definition ? undefined : { skip: true, input: undefined }
}

// Apply `pick[(input, info)]` which omits the current input if `false` is
// returned. It also skips the current rule.
// For example, this is useful when several commands share some properties but
// not all.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'pick',
  hasInput: true,
  undefinedInput: true,
  normalize: normalizeBoolean,
  main,
}
