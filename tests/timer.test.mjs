import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'
const source = readFileSync(new URL('../src/timer.ts', import.meta.url), 'utf8')
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const module = { exports: {} }
new Function('module', 'exports', js)(module, module.exports)
const { remainingAt, formatTime, focusElapsed } = module.exports

test('countdown uses timestamps and stops at zero', () => {
  assert.equal(remainingAt(26000, 1000), 25)
  assert.equal(remainingAt(26000, 26500), 0)
  assert.equal(remainingAt(26000, 50000), 0)
})
test('focus excludes paused and break time when remaining is preserved', () => {
  assert.equal(focusElapsed(1500, 1491), 9)
  assert.equal(focusElapsed(1500, 1491), 9)
  assert.equal(formatTime(1491), '24:51')
})
