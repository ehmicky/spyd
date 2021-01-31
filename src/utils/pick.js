import filterObj from 'filter-obj'

// Select specific properties of an object
export const pick = function (obj, props) {
  return filterObj(obj, (key) => props.includes(key))
}
