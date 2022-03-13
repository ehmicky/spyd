// We distinguish between:
//  - Missing property name: return no entries
//  - Property exists but has `undefined` value: return an entry
const iterate = function (value, token) {
  return [{ value: value[token], prop: token, missing: !(token in value) }]
}

export const PROP_TOKEN = {
  name: 'prop',
  array: false,
  iterate,
}
