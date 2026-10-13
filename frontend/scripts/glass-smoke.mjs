import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { boundedValue, nextEnabledIndex } from '../src/glass/policy.ts'

assert.equal(boundedValue(1.27, 0, 2, 0.1), 1.3)
assert.equal(boundedValue(-5, 0, 2, 1), 0)
assert.equal(boundedValue(9, 0, 2, 1), 2)
assert.equal(nextEnabledIndex([false, true, false], 0, 1), 2)
assert.equal(nextEnabledIndex([false, true, false], 2, 1), 0)

const runtime = await readFile(new URL('../src/glass/runtime.ts', import.meta.url), 'utf8')
const dropdown = await readFile(new URL('../src/components/glass/GlassDropdown.vue', import.meta.url), 'utf8')
assert.match(runtime, /createGlassScene/)
assert.match(runtime, /maxSurfaces: glassPolicy\.maxSurfaces/)
assert.match(runtime, /controller\.dispose\(\)/)
assert.match(dropdown, /morphFrom:/)
assert.match(dropdown, /data-ending-style/)
console.log('liquid glass policy and lifecycle smoke checks passed')
