const joinLines = function (delimiter, lines) {
  return lines.filter(Boolean).join(delimiter)
}

// Join related subsections together
export const joinSubSections = joinLines.bind(undefined, '\n')
// Join unrelated sections together
export const joinSections = joinLines.bind(undefined, '\n\n')
