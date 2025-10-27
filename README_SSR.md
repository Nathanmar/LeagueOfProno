# 🏆 LeagueOfProno - SSR & Real-time Update Implementation

## 📋 What's New

Your LeagueOfProno platform now features **Server-Side Rendering (SSR)** with **real-time synchronization**!

### ✨ New Features

✅ **Server-Side Rendering** - Better SEO and initial page load performance  
✅ **Real-time WebSocket Sync** - Live score updates without page refresh  
✅ **Smart API Client** - HTTP + WebSocket with auto-reconnect  
✅ **React Hooks** - Easy data fetching and mutations  
✅ **Production Ready** - Error handling, CORS, type safety  

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/sugow0/Desktop/Github/LeagueOfProno
pnpm install
```

### 2. Setup Environment

Create `.env.local` in `packages/prono-front/`:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

### 3. Run Services

**Terminal 1 - API Server:**
```bash
cd packages/prono-api
pnpm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend Dev:**
```bash
cd packages/prono-front
pnpm run dev
# Opens on http://localhost:5173
```

---

## 📁 Project Structure

### Frontend (`packages/prono-front/`)

```
src/
├── entry.server.tsx          # Server entry point for SSR
├── main.tsx                  # Client hydration entry
├── App.tsx                   # Main app with RealtimeProvider
├── services/
│   └── api.ts                # HTTP + WebSocket client
├── hooks/
│   └── useRealtimeData.ts     # Hooks for data fetching
├── contexts/
│   └── RealtimeContext.tsx    # WebSocket provider
└── components/               # Your React components
```

### API (`packages/prono-api/`)

```
src/
└── index.ts                  # Hono server with API endpoints
```

---

## 🔌 API Endpoints

All endpoints return:

```json
{
  "success": true,
  "data": { /* ... */ }
}
```

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `PUT /api/matches/:id/score` - Update match score

### Predictions
- `GET /api/predictions` - Get predictions
- `POST /api/predictions` - Create prediction
- `PUT /api/predictions/:id` - Update prediction

### Groups
- `GET /api/groups` - Get groups
- `GET /api/groups/:id/leaderboard` - Get leaderboard

### WebSocket
- `WS /ws` - Real-time updates

---

## 💻 Using in Components

### Get Real-time Data

```tsx
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { endpoints } from '@/services/api';

export function Matches() {
  const { data: matches, loading } = useRealtimeData(
    endpoints.matches,
    'matches:updated' // Event type for real-time sync
  );

  if (loading) return <p>Loading...</p>;
  return <ul>{matches?.map(m => <li key={m.id}>{m.team_a} vs {m.team_b}</li>)}</ul>;
}
```

### Update Scores

```tsx
import { useScoreUpdates } from '@/hooks/useRealtimeData';

export function UpdateScore({ matchId }: { matchId: string }) {
  const { match, updateScore, loading } = useScoreUpdates(matchId);

  return (
    <button 
      onClick={() => updateScore(3, 2)} 
      disabled={loading}
    >
      Set 3-2
    </button>
  );
}
```

### Perform Mutations

```tsx
import { useMutation } from '@/hooks/useRealtimeData';

const { mutate, loading, error } = useMutation('post');

const result = await mutate('/api/predictions', {
  match_id: 'match_123',
  predicted_winner: 'team_a',
});
```

---

## 🔄 Real-time Flow

```
┌─────────────────────────────────┐
│  Component                      │
│  useRealtimeData(endpoint, type) │
└────────────┬────────────────────┘
             │
             ├─→ HTTP GET (initial load)
             │
             └─→ WebSocket subscribe(type)
                    ↓
             Receives live updates
             → Component re-renders
```

---

## 🔧 Backend Integration with Convex

Your API should:

1. **Fetch from Convex**
   ```typescript
   const matches = await convex.query(api.matches.list);
   return c.json({ success: true, data: matches });
   ```

2. **Update via Convex**
   ```typescript
   const updated = await convex.mutation(api.matches.updateScore, {
     matchId, scoreA, scoreB
   });
   broadcastEvent(`match:${matchId}:updated`, updated);
   ```

3. **Broadcast WebSocket Events**
   ```typescript
   // Send to connected clients
   wsClients.forEach(client => {
     client.send(JSON.stringify({
       type: 'match:updated',
       data: updated
     }));
   });
   ```

---

## 📊 Types & Interfaces

```typescript
// API Response
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Match
interface Match {
  id: string;
  team_a: string;
  team_b: string;
  status: 'upcoming' | 'completed';
  score_a?: number;
  score_b?: number;
}

// Prediction
interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner: 'team_a' | 'team_b';
  points_earned: number;
}
```

---

## 🧪 Testing

### Test SSR Build
```bash
cd packages/prono-front
pnpm run build
pnpm run preview
# Check http://localhost:5173
```

### Test API
```bash
# All endpoints
curl http://localhost:3001/api/matches
curl http://localhost:3001/api/predictions
curl http://localhost:3001/health
```

### Test WebSocket
```javascript
// In browser console
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (e) => console.log('Event:', JSON.parse(e.data));
```

---

## 📚 Documentation Files

- **`MISE_EN_PLACE_SSR.md`** - Detailed setup and integration guide (French)
- **`SSR_GUIDE.md`** - SSR configuration guide
- **`prono-front/README.md`** - Frontend documentation

---

## 🛠️ Troubleshooting

### WebSocket won't connect
→ Check `VITE_WS_URL` in `.env.local`  
→ Verify API listens on correct port  
→ Check browser console for connection errors  

### Data not syncing in real-time
→ Verify API broadcasts correct event type  
→ Check event type matches `useRealtimeData(endpoint, eventType)`  
→ Check `useRealtime().connected` in DevTools  

### SSR not working
→ Verify `src/entry.server.tsx` exists  
→ Check `react-router.config.ts` has `ssr: true`  
→ Check build logs for errors  

---

## 📦 Installed Packages

### Frontend
- `@react-router/dev` - SSR framework
- `@react-router/node` - Node.js integration
- `react 18.3.1` - React library
- `vite 6.3.5` - Build tool

### API
- `hono 4.10.3` - Web framework
- `@hono/node-server` - Node.js server

---

## 🎯 Next Steps

1. ✅ Connect API endpoints to Convex
2. ✅ Implement WebSocket event broadcasting
3. ✅ Update components to use real-time hooks
4. ✅ Test score updates and predictions
5. ✅ Deploy to production

---

## 📞 Support

For issues or questions, check:
- Browser console errors
- API server logs
- WebSocket connection status
- Environment variables

---

**Happy coding! 🚀**
