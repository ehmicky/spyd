#!/usr/bin/env node
import { startRunner } from '../common/ipc.js'

import { load } from './load/main.js'
import { measureTask as benchmark } from './measure/main.js'

startRunner({ load, benchmark })
