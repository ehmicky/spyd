// We only keep options that are relevant for reporting
export const getOpts = function ({ duration, run: runOpts }) {
  const durationA = duration / NANOSECS_TO_SECS
  const runOptsA = getRunOpts(runOpts)
  return { duration: durationA, ...runOptsA }
}

const NANOSECS_TO_SECS = 1e9

const getRunOpts = function (runOpts) {
  const runOptsA = Object.fromEntries(runOpts.filter(hasRunOpt).map(getRunOpt))

  if (Object.keys(runOptsA).length === 0) {
    return {}
  }

  return { run: runOptsA }
}

const hasRunOpt = function ({ opts }) {
  return Object.keys(opts).length !== 0
}

const getRunOpt = function ({ name, opts }) {
  return [name, opts]
}
