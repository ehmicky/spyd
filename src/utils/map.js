import mapObj from 'map-obj'

export const mapValues = function (object, mapper, opts) {
  return mapObj(object, (key, value) => [key, mapper(value, key)], opts)
}
