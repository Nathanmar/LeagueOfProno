import { httpAction } from './_generated/server.js'
import { api } from './_generated/api.js'

export const httpListMatches = httpAction(async (ctx) => {
  const data = await ctx.runQuery(api["matches"].listMatches)
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
