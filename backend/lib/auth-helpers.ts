// Admin verification and middleware helpers
// Centralized auth utilities for securing API endpoints

import { Context } from 'hono'
import { verifyAuthMiddleware } from '../api/auth'

/**
 * Check if a Farcaster FID is an admin
 * Only FID 326181 has admin access
 */
export function isAdmin(fid: string | null): boolean {
  return fid === '326181'
}

/**
 * Middleware that requires both authentication AND admin status
 * Use this for admin-only endpoints like /sync/* and /music-ai/* POST operations
 *
 * Usage:
 *   app.post('/admin-endpoint', verifyAdminMiddleware, async (c) => { ... })
 */
export const verifyAdminMiddleware = async (c: Context, next: Function) => {
  // First verify JWT and extract FID
  await verifyAuthMiddleware(c, next)

  // Then check if the verified FID is an admin
  const fid = c.get('fid')
  if (!isAdmin(fid)) {
    return c.json({ error: 'Admin access required' }, 403)
  }

  await next()
}
