import mapObj from 'map-obj'

// Map the values of an object
export const mapValues = (object, mapper, opts) =>
  mapObj(object, (key, value) => [key, mapper(value, key)], opts)

// Map the keys of an object
export const mapKeys = (object, mapper, opts) =>
  mapObj(object, (key, value) => [mapper(key, value), value], opts)
