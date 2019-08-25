// Substitute template <<variable>> using a set of variables:
//  - environment variables
//  - file.variables
//  - task.before output (<<before>>)
//  - each <<variation>>
// Can be escaped as <<<variable>>>
export const applyTemplate = function(string, variables) {
  if (string === undefined) {
    return
  }

  return string.replace(TEMPLATE_REGEXP, (token, varName) =>
    replaceToken(varName, variables),
  )
}

// We use <> because:
//  - $ and % are already used in shell, leading to confusion
//  - {} is not YAML-friendly
// TODO: prepend (?<!<) after dropping support for Node 8
const TEMPLATE_REGEXP = /<<([^<>]+)>>(?!>)/gu

const replaceToken = function(varName, variables) {
  const value = variables[varName]

  if (value === undefined) {
    return ''
  }

  // Can use variables recursively
  return applyTemplate(value, variables)
}
