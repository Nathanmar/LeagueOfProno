import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Utility function to generate invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Convex HTTP actions URL (override with env)
const CONVEX_HTTP_ACTIONS_URL = 'https://fiery-hamster-202.convex.site'

async function callConvexHttpAction(path: string, options?: RequestInit) {
  const url = `${CONVEX_HTTP_ACTIONS_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Convex HTTP action ${url} returned ${res.status} ${res.statusText} ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

// API Routes - Matches
app.get('/api/matches', async (c) => {
  try {
    const data = await callConvexHttpAction('matches')
    return c.json({ success: true, data })
  } catch (err: any) {
    console.error('Error fetching matches from Convex:', err)
    if (err.message.includes('404')) {
      return c.json({ success: false, error: 'HTTP action not found. Make sure Convex functions are deployed.' }, 404)
    }
    return c.json({ success: false, error: String(err) }, 500)
  }
})

app.get('/api/matches/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const all = await callConvexHttpAction('listMatches')
    const match = Array.isArray(all) ? all.find((m: any) => String(m.id) === String(id)) : null
    if (!match) return c.json({ success: false, error: 'Not found' }, 404)
    return c.json({ success: true, data: match })
  } catch (err: any) {
    console.error(`Error fetching match ${id} from Convex:`, err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

app.put('/api/matches/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  // Try to forward to a Convex HTTP action `updateMatch/{id}` if available
  try {
    const res = await callConvexHttpAction(`updateMatch/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return c.json({ success: true, data: res })
  } catch (err: any) {
    console.warn('updateMatch action not available or failed:', err)
    // Fallback: return the body as-is
    return c.json({ success: true, data: { id, ...body } })
  }
})

app.put('/api/matches/:id/score', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { score_a, score_b } = body

  // Try to forward to a Convex HTTP action `updateMatchScore/{id}` if available
  try {
    const res = await callConvexHttpAction(`updateMatchScore/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score_a, score_b }),
    })
    return c.json({ success: true, data: res })
  } catch (err: any) {
    console.warn('updateMatchScore action not available or failed:', err)
    return c.json({ success: true, data: { id, score_a, score_b } })
  }
})

// API Routes - Predictions
app.get('/api/predictions', async (c) => {
  try {
    const data = await callConvexHttpAction('getPredictions')
    return c.json({ success: true, data })
  } catch (err: any) {
    console.error('Error fetching predictions from Convex:', err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

app.post('/api/predictions', async (c) => {
  const body = await c.req.json()
  try {
    const res = await callConvexHttpAction('createPrediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return c.json({ success: true, data: res })
  } catch (err: any) {
    console.warn('createPrediction action not available or failed:', err)
    return c.json({ success: true, data: { id: `pred_${Date.now()}`, ...body } })
  }
})

// API Routes - Groups
app.get('/api/groups', async (c) => {
  try {
    const data = await callConvexHttpAction('groups')
    return c.json({ success: true, data })
  } catch (err: any) {
    console.error('Error fetching groups from Convex:', err)
    if (err.message.includes('404')) {
      return c.json({ success: false, error: 'HTTP action not found. Make sure Convex functions are deployed.' }, 404)
    }
    return c.json({ success: false, error: String(err) }, 500)
  }
})

app.post('/api/groups', async (c) => {
  const body = await c.req.json()
  try {
    const res = await callConvexHttpAction('createGroup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return c.json({ success: true, data: res })
  } catch (err) {
    const error = err as Error
    console.warn('createGroup action not available or failed:', error.message)
    return c.json({ success: true, data: { id: `group_${Date.now()}`, invite_code: generateInviteCode(), ...body } })
  }
})

app.get('/api/groups/:id/leaderboard', async (c) => {
  const id = c.req.param('id')
  try {
    // Try a dedicated leaderboard action first
    try {
      const data = await callConvexHttpAction(`getGroupLeaderboard/${id}`)
      return c.json({ success: true, data })
    } catch {
      const groups = await callConvexHttpAction('getGroups')
      const group = Array.isArray(groups) ? groups.find((g: any) => String(g.id) === String(id)) : null
      if (!group) return c.json({ success: false, error: 'Group not found' }, 404)
      return c.json({ success: true, data: group.leaderboard || [] })
    }
  } catch (err: any) {
    console.error(`Error fetching leaderboard for group ${id}:`, err)
    return c.json({ success: false, error: String(err) }, 500)
  }
})

app.get('api/register', async (c) => {
  return c.json({ message: 'Register endpoint placeholder' })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// WebSocket Support (placeholder)
const wsClients = new Set<unknown>()

app.get('/ws', (c) => {
  return c.text('WebSocket endpoint')
})

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Prono API running on http://localhost:${info.port}`)
})

