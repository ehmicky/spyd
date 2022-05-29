import { normalizePropertyPath } from '../normalize/common.js'

const main = function (definition) {
  return { rename: definition }
}

// Apply `rename[(input, info)]` which transforms the property's name.
// This can be used for aliasing and deprecation.
// eslint-disable-next-line import/no-default-export
export default {
  name: 'rename',
  hasInput: true,
  exampleDefinition: 'newPropertyName',
  normalize: normalizePropertyPath,
  main,
}
