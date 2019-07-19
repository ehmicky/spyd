export const reportResults = function(results) {
  results.forEach(reportResult)
}

const reportResult = function({ name, parameter, duration: { average } }) {
  const parameterA = parameter === undefined ? '' : ` (${parameter})`
  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(
    `${name}${parameterA}: ${Math.round(MICROSECS_IN_SECS / average)} ops/sec`,
  )
}

const MICROSECS_IN_SECS = 1e6
