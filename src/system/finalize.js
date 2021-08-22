// Depending on format, it is either passed to the reporter or appended by us.
export const finalizeFooter = function ({ footer, ...result }, keepFooter) {
  const footerA = footer.filter(hasFields).map(normalizeDepth)
  const resultA = keepFooter ? { ...result, footer: footerA } : result
  return { result: resultA, footer: footerA }
}

const hasFields = function ({ fields }) {
  return Object.keys(fields).length !== 0
}

const normalizeDepth = function ({ title, fields }) {
  return title === undefined ? fields : { [title]: fields }
}
