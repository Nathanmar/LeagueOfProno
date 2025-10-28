import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient as PC } from '@prisma/client'

const app = new Hono()
const prisma = new PC()

// Enable CORS for all routes
app.use('*', cors())

// Health check route
app.get('/', (c) => {
  return c.json({ message: 'API Public is running' })
})

// Get all matches
app.get('/matches', async (c) => {
  try {
    const matches = await prisma.matches.findMany({
      orderBy: {
        match_date: 'desc'
      }
    })
    return c.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error details:', errorMessage)
    return c.json({ error: 'Failed to fetch matches', details: errorMessage }, { status: 500 })
  }
})

// Get a specific match by ID
app.get('/matches/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const match = await prisma.matches.findUnique({
      where: { id }
    })
    
    if (!match) {
      return c.json({ error: 'Match not found' }, 404)
    }
    
    return c.json(match)
  } catch (error) {
    console.error('Error fetching match:', error)
    return c.json({ error: 'Failed to fetch match' }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
