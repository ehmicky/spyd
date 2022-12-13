import { normalizeBoolean } from '../normalize/common.js'

const main = (definition) => (definition ? undefined : { skip: true })

// Apply `condition[(input, info)]` which skips the current rule if `false`
// is returned.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'condition',
  hasInput: true,
  undefinedInput: true,
  exampleDefinition: true,
  normalize: normalizeBoolean,
  main,
}
