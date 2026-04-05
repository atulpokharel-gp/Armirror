import { describe, expect, it, vi, beforeEach } from 'vitest'
import { POST } from './route'

const { auditLogCreate } = vi.hoisted(() => ({ auditLogCreate: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: auditLogCreate,
    },
  },
}))

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    auditLogCreate.mockReset()
  })

  it('returns 400 for missing fields', async () => {
    const request = new Request('http://localhost/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: '' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Name and email are required')
    expect(auditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email format', async () => {
    const request = new Request('http://localhost/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alex', email: 'not-an-email' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid email')
    expect(auditLogCreate).not.toHaveBeenCalled()
  })

  it('returns 200 and writes audit log for valid payload', async () => {
    auditLogCreate.mockResolvedValueOnce({})
    const request = new Request('http://localhost/api/waitlist', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alex', email: 'alex@example.com' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(auditLogCreate).toHaveBeenCalledTimes(1)
  })
})
