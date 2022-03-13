// By using `for in`, we purposely exclude both symbols and inherited properties
const iterate = function (value) {
  return Array.isArray(value)
    ? value.map((childValue, index) => ({
        value: childValue,
        prop: index,
        missing: false,
      }))
    : Object.keys(value).map((childKey) => ({
        value: value[childKey],
        prop: childKey,
        missing: false,
      }))
}

export const ANY_TOKEN = {
  name: 'any',
  array: false,
  iterate,
}
