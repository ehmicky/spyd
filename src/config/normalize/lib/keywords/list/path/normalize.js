// Ensure the `path` definition is correct
export const normalize = function (definition) {
  if (!Array.isArray(definition)) {
    throw new TypeError('must be an array.')
  }

  definition.forEach(checkKeyword)
  return new Set(definition)
}

const checkKeyword = function (keyword) {
  if (typeof keyword !== 'string') {
    throw new TypeError('must have string keywords.')
  }

  if (!KEYWORDS_SET.has(keyword)) {
    const availableKeywords = KEYWORDS.map(quoteWord).join(', ')
    throw new TypeError(`must have keywords among: ${availableKeywords}`)
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
export const EXAMPLE_KEYWORDS = [EXIST_KEYWORD, FILE_KEYWORD, READ_KEYWORD]
const KEYWORDS_SET = new Set(KEYWORDS)
