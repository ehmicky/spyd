// TODO: validate when invalid `name`
export const parsePropName = function (name) {
  const propPath = [...`.${name}`.matchAll(PROP_NAME_REGEXP)].map(normalizeProp)
  return propPath
}

const PROP_NAME_REGEXP =
  /(?<loose>\?)?((\.(?<propName>[^.?[\]]+))|(\[(?<propIndex>[\d*]+)\]))/guy

const normalizeProp = function ({ groups: { propName, propIndex, loose } }) {
  const value = getPropValue(propName, propIndex)
  const isArray = propIndex !== undefined
  const looseBool = loose !== undefined
  return { value, isArray, loose: looseBool }
}

const getPropValue = function (propName, propIndex) {
  if (propName !== undefined) {
    return propName
  }

  return propIndex === '*' ? propIndex : Number(propIndex)
}
