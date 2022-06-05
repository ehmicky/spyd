// Error properties are non-enumerable
export const setErrorProperty = function (error, propName, value) {
  // eslint-disable-next-line fp/no-mutating-methods
  Object.defineProperty(error, 'name', {
    value,
    writable: true,
    enumerable: false,
  })
}
