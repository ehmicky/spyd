export const reportResults = function(results) {
  results.forEach(reportResult)
}

const reportResult = function({ task, parameter, duration: { average } }) {
  const parameterA = parameter === undefined ? '' : ` (${parameter})`
  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(
    `${task}${parameterA}: ${Math.round(MILLISECS_IN_SECS / average)} ops/sec`,
  )
}

const MILLISECS_IN_SECS = 1e3
