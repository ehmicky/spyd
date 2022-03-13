const iterate = function (value, token) {
  return Object.keys(value)
    .filter((childKey) => token.test(childKey))
    .map((childKey) => ({
      value: value[childKey],
      prop: childKey,
      missing: false,
    }))
}

export const REGEXP_TOKEN = {
  name: 'regExp',
  array: false,
  iterate,
}
