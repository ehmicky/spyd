import stringWidth from 'string-width'

export const getStringWidth = function (string) {
  return stringWidth(string, { ambiguousIsNarrow: true })
}
