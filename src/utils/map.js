import mapObj from 'map-obj'

// Map the values of an object
export const mapValues = function (object, mapper, opts) {
  return mapObj(object, (key, value) => [key, mapper(value, key)], opts)
}

// Map the keys of an object
export const mapKeys = function (object, mapper, opts) {
  return mapObj(object, (key, value) => [mapper(key, value), value], opts)
}
