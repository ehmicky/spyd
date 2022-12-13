import { normalizeString } from '../normalize/common.js'

const main = (definition) => ({ warning: definition })

// Apply `warn[(input, info)]` which can return a string to print as warning
// eslint-disable-next-line import/no-default-export
export default {
  name: 'warn',
  hasInput: true,
  exampleDefinition: 'is deprecated. Please use "otherProperty" instead.',
  normalize: normalizeString,
  main,
}
