export const config = new Set([
  // Hide the abscissa with the `min`, `median` and `max` labels
  {
    name: 'mini',
    default: false,
    schema: { type: 'boolean' },
  },
  // Smooth the histogram values.
  // This is especially useful when there are only a few measures that are all
  // integers.
  {
    name: 'smooth',
    default: true,
    schema: { type: 'boolean' },
  },
])
