#!/usr/bin/env node
import { performRunner } from '../common/ipc.js'

import { load } from './load/main.js'
import { measure } from './measure/main.js'

performRunner({ load, measure })
