// Ensure the `path` definition is correct
export const normalize = function (definition) {
  if (!Array.isArray(definition)) {
    throw new TypeError(`The definition must be an array.`)
  }

  definition.forEach(checkKeyword)
  return new Set(definition)
}

const checkKeyword = function (keyword) {
  if (typeof keyword !== 'string') {
    throw new TypeError(`The definition value ${keyword} must be a string.`)
  }

  if (!KEYWORDS_SET.has(keyword)) {
    const availableKeywords = KEYWORDS.map(quoteWord).join(', ')
    throw new TypeError(
      `The definition value "${keyword}" must be one of: ${availableKeywords}`,
    )
  }
}

const quoteWord = function (keyword) {
  return `"${keyword}"`
}

export const EXIST_KEYWORD = 'exist'
export const FILE_KEYWORD = 'file'
export const DIR_KEYWORD = 'directory'
export const READ_KEYWORD = 'read'
export const WRITE_KEYWORD = 'write'
export const EXEC_KEYWORD = 'execute'

const KEYWORDS = [
  EXIST_KEYWORD,
  FILE_KEYWORD,
  DIR_KEYWORD,
  READ_KEYWORD,
  WRITE_KEYWORD,
  EXEC_KEYWORD,
]
const KEYWORDS_SET = new Set(KEYWORDS)
