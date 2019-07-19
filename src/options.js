export const getOpts = function(opts) {
  return { ...DEFAULT_OPTS, ...opts }
}

const DEFAULT_OPTS = {
  // Increasing it makes measurements more precise but makes run slower
  repeat: 1e3,
  // Increasing it makes run faster but makes it more likely for machine to
  // crash
  concurrency: 1e2,
}
