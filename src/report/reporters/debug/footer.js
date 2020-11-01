import { blue, dim, underline } from 'chalk'
import indentString from 'indent-string'

// Retrieve footer: system, timestamp, group, link
export const getFooter = function ({
  timestampPretty,
  systemsPretty,
  gitPretty,
  ciPretty,
  commandsPretty,
  group,
}) {
  const footers = [
    commandsPretty,
    systemsPretty,
    addPrefix('Group', group),
    addPrefix('Timestamp', timestampPretty),
    gitPretty,
    ciPretty,
    LINK_FOOTER,
  ].filter(Boolean)

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const addPrefix = function (name, value) {
  if (value === undefined) {
    return
  }

  return `${blue.bold(`${name}:`)} ${value}`
}

const LINK_FOOTER = dim(
  `Benchmarked with spyd (${underline('https://github.com/ehmicky/spyd')})`,
)

const indentFooter = function (footer) {
  return indentString(footer, 1)
}
