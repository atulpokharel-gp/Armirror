import { describe, expect, it } from 'vitest'
import { isValidEmail } from './utils'

describe('isValidEmail', () => {
  it('accepts valid email addresses', () => {
    expect(isValidEmail('alex@example.com')).toBe(true)
    expect(isValidEmail('a.b+tag@sub.domain.co')).toBe(true)
  })

  it('rejects invalid email addresses', () => {
    expect(isValidEmail('a@b.c')).toBe(false)
    expect(isValidEmail('@@x.y')).toBe(false)
    expect(isValidEmail('no-at-symbol.com')).toBe(false)
    expect(isValidEmail('bad@domain')).toBe(false)
    expect(isValidEmail('bad..dots@example.com')).toBe(false)
  })
})
