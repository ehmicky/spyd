// Handle ** recursion.
// It matches 0, 1 or more levels.
//  - It can match 0 levels, i.e. the current object
// It is the same as the union of . * *.* *.*.* and so on.
// Using both * and ** can express minimum depth, e.g. *.** or *.*.**
const recurse = function (queryArray, index) {
  const parentQuery = queryArray.slice(0, index)
  const childQuery = queryArray.slice(index)
  return [parentQuery, [...parentQuery, { type: 'any' }, ...childQuery]]
}

export const ANY_DEEP_TOKEN = {
  name: 'anyDeep',
  array: false,
  recurse,
}
