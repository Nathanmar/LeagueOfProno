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

// API Routes - Matches
app.get('/api/matches', (c) => {
  // TODO: Remplacer par les vraies données de Convex
  return c.json({
    success: true,
    data: [
      { id: 'match_001', team_a: 'T1', team_b: 'Gen.G', status: 'upcoming' },
      { id: 'match_002', team_a: 'G2', team_b: 'Fnatic', status: 'completed', score_a: 3, score_b: 1 }
    ]
  })
})

app.get('/api/matches/:id', (c) => {
  const id = c.req.param('id')
  // TODO: Remplacer par les vraies données de Convex
  return c.json({
    success: true,
    data: { id, team_a: 'T1', team_b: 'Gen.G', status: 'upcoming' }
  })
})

app.put('/api/matches/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  
  // TODO: Remplacer par l'update Convex
  // TODO: Broadcaster l'event WebSocket "match:${id}:updated"
  
  return c.json({
    success: true,
    data: { id, ...body }
  })
})

app.put('/api/matches/:id/score', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { score_a, score_b } = body
  
  // TODO: Remplacer par l'update Convex
  // TODO: Broadcaster l'event WebSocket "match:${id}:updated"
  // TODO: Recalculer les prédictions et points
  
  return c.json({
    success: true,
    data: { id, score_a, score_b }
  })
})

// API Routes - Predictions
app.get('/api/predictions', (c) => {
  // TODO: Remplacer par les vraies données de Convex
  return c.json({
    success: true,
    data: []
  })
})

app.post('/api/predictions', async (c) => {
  const body = await c.req.json()
  
  // TODO: Remplacer par la création Convex
  // TODO: Broadcaster l'event WebSocket "predictions:updated"
  
  return c.json({
    success: true,
    data: { id: 'pred_new', ...body }
  })
})

// API Routes - Groups
app.get('/api/groups', (c) => {
  // TODO: Remplacer par les vraies données de Convex
  return c.json({
    success: true,
    data: []
  })
})

app.get('/api/groups/:id/leaderboard', (c) => {
  const id = c.req.param('id')
  // TODO: Remplacer par les vraies données de Convex
  return c.json({
    success: true,
    data: []
  })
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

// WebSocket Support
const wsClients = new Set<unknown>()

app.get('/ws', (c) => {
  // NOTE: Implémentation du WebSocket dépendra de votre setup
  // Voir https://hono.dev/docs/guides/websocket pour plus d'infos
  return c.text('WebSocket endpoint')
})

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Prono API running on http://localhost:${info.port}`)
})

