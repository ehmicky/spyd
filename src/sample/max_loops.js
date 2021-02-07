// `maxLoops` is the number of `repeat` loops the sample should measure.
// Each sample needs to perform a specific amount of measures (`maxLoops`).
// We do this instead of passing a maximum duration instead because:
//   - It is easier to implement for runner.
//   - It is faster, since it does not require computing a timestamp, which
//     allows running more loops in very fast tasks.
//   - It can be used to prevent memory crash in runners.
// The `maxLoops` is computed so the sample lasts a specific duration. We use a
// hardcoded duration because:
//   - It ensures each sample has roughly the same duration. This is because
//     some runtime optimization applies as a new sample is run. We do not want
//     this runtime to spread differently between samples due to different
//     durations.
//   - It is small enough to ensure that tasks with slow measures aggregation
//     (due to having lots of measures) do not prevent other tasks' previews
//   - It is large enough to spend enough time measuring as opposed to IPC and
//     combination orchestration
//   - It is large enough so cold starts at the beginning of each sample are a
//     small percentage of the overall measures.
// We purposely avoid using `duration` so that increasing `duration`
// does not change measures.
// Since `maxLoops` aims to last a specific duration, we need the last
// `measureDuration` to estimate it. If the `repeat` changes, we need to take it
// into account as well, which is especially important during calibration.
export const getMaxLoops = function ({
  measureDuration,
  repeat,
  repeatLast,
  sampleLoops,
}) {
  // First sample of the benchmark
  if (measureDuration === 0) {
    return 1
  }

  const repeatGrowth = repeat / repeatLast
  const measureDurationPerLoop = measureDuration / sampleLoops
  const targetMaxLoops = Math.round(
    TARGET_DURATION / (measureDurationPerLoop * repeatGrowth),
  )
  return Math.max(targetMaxLoops, 1)
}

// 100ms
// Small enough to give responsive reporting.
// Large enough to spend enough time measuring.
const TARGET_DURATION = 1e8
