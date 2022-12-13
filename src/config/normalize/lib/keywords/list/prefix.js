import { normalizeString } from '../normalize/common.js'

const main = (definition) => ({ info: { prefix: definition } })

// eslint-disable-next-line import/no-default-export
export default {
  name: 'prefix',
  undefinedInput: true,
  exampleDefinition: 'Configuration property',
  normalize: normalizeString,
  main,
}
