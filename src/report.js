export const reportResults = function(results) {
  results.forEach(reportResult)
}

const reportResult = function({ name, duration: { average } }) {
  // eslint-disable-next-line no-console, no-restricted-globals
  console.log(`${name}: ${Math.round(MICROSECS_IN_SECS / average)} ops/sec`)
}

const MICROSECS_IN_SECS = 1e6
