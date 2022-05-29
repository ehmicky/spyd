import { normalizeString } from '../normalize/common.js'

const main = function (definition) {
  return { info: { prefix: definition } }
}

// eslint-disable-next-line import/no-default-export
export default {
  name: 'prefix',
  undefinedInput: true,
  normalize: normalizeString,
  main,
}
