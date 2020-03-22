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
  info,
  context,
  link,
}) {
  const footers = [
    ...getInfoFooters({ info, systemsPretty, commandsPretty }),
    ...getContextFooters({
      context,
      gitPretty,
      ciPretty,
      timestampPretty,
      group,
    }),
    ...getLinkFooters(link),
  ]

  if (footers.length === 0) {
    return ''
  }

  const footer = footers.map(indentFooter).join('\n\n')
  return `\n\n${footer}`
}

const getInfoFooters = function ({ info, systemsPretty, commandsPretty }) {
  if (!info) {
    return []
  }

  return [systemsPretty, commandsPretty]
}

const getContextFooters = function ({
  context,
  gitPretty,
  ciPretty,
  timestampPretty,
  group,
}) {
  if (!context) {
    return []
  }

  const timestampPrettyA = `${blue.bold('Timestamp:')} ${timestampPretty}`
  const groupPretty = `${blue.bold('Group:')} ${group}`
  return [gitPretty, ciPretty, timestampPrettyA, groupPretty].filter(Boolean)
}

const getLinkFooters = function (link) {
  if (!link) {
    return []
  }

  const linkPretty = dim(
    `Benchmarked with spyd (${underline('https://github.com/ehmicky/spyd')})`,
  )
  return [linkPretty]
}

const indentFooter = function (footer) {
  return indentString(footer, 1)
}
