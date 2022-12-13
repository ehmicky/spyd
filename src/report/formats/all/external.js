// Format meant for reporters without any return value.
// For example: separate programs, network requests, desktop notifications
export const EXTERNAL_FORMAT = {
  // Name used to access the format
  name: 'external',
  // Return whether this format should be used, for a given output
  detect: (output) => output === 'external',
  // At least one of the following reporter methods must exist to use this
  // format
  methods: ['reportExternal'],
  // Call the reporter's methods and possibly return or manipulate its return
  // value
  report: async ({ reportExternal }, reporterArgs) => {
    await reportExternal(...reporterArgs)
  },
  // Whether it is possible to use two reporters with this format and with the
  // same `output` but with possibly different configurations
  concat: false,
  // Function normalizing the footer to append.
  // `undefined` if the `footer` should be passed to the report function instead
  footer: undefined,
  // Whether top/bottom/left/right padding should be added
  padding: false,
}
