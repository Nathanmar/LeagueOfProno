# 🚀 Mise en place du SSR et Synchronisation Temps Réel

## ✅ Résumé des Changements

### 1. Infrastructure SSR (Server-Side Rendering)

**Fichiers créés/modifiés:**
- ✅ `src/entry.server.tsx` - Point d'entrée serveur pour le rendu
- ✅ `src/main.tsx` - Hydratation côté client
- ✅ `vite.config.ts` - Configuration du plugin React Router SSR
- ✅ `react-router.config.ts` - Configuration React Router

**Bénéfices:**
- 🚀 Rendu HTML côté serveur pour SEO
- ⚡ Streaming HTML pour les performances
- 🎯 Hydratation progressive côté client

### 2. Client API Temps Réel

**Fichier:** `src/services/api.ts`
- Client HTTP pour prono-api (GET, POST, PUT, DELETE)
- WebSocket client pour les mises à jour temps réel
- Reconnexion automatique avec backoff exponentiel

**Fonctionnalités:**
```typescript
// HTTP Client
apiClient.get<T>(endpoint)
apiClient.post<T>(endpoint, body)
apiClient.put<T>(endpoint, body)
apiClient.delete<T>(endpoint)

// WebSocket Client
realtimeClient.connect()
realtimeClient.subscribe(eventType, callback)
realtimeClient.send(type, data)
realtimeClient.disconnect()
```

### 3. Hooks Réactifs

**Fichier:** `src/hooks/useRealtimeData.ts`

```typescript
// Récupérer les données avec sync temps réel
const { data, loading, error, refetch } = useRealtimeData(endpoint, eventType)

// Effectuer une mutation
const { mutate, loading, error } = useMutation<Input, Output>("put")

// Gérer les scores temps réel
const { match, updateScore, loading } = useScoreUpdates(matchId)
```

### 4. Context Provider

**Fichier:** `src/contexts/RealtimeContext.tsx`
- Initialise la connexion WebSocket côté client
- Fournit l'état de connexion à toute l'app

**Utilisation:**
```typescript
<RealtimeProvider>
  <App />
</RealtimeProvider>
```

### 5. API Backend

**Fichier:** `packages/prono-api/src/index.ts`
- Endpoints REST pour les données
- Support CORS activé
- Structure prête pour Convex

## 🔧 Configuration

### Variables d'Environnement

Créez `.env.local`:
```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

### Structure des Réponses API

Tous les endpoints doivent retourner:
```json
{
  "success": true,
  "data": { /* ... */ }
}
```

En cas d'erreur:
```json
{
  "success": false,
  "error": "Message d'erreur"
}
```

## 🎯 Utilisation dans les Composants

### Exemple 1: Afficher les Matchs avec Sync Temps Réel

```tsx
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { endpoints } from '@/services/api';

export function MatchesList() {
  const { data: matches, loading, error } = useRealtimeData(
    endpoints.matches,
    'matches:updated' // Event WebSocket à recevoir
  );

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;

  return (
    <ul>
      {matches?.map(match => (
        <li key={match.id}>
          {match.team_a} vs {match.team_b}
        </li>
      ))}
    </ul>
  );
}
```

### Exemple 2: Mettre à Jour un Score

```tsx
import { useScoreUpdates } from '@/hooks/useRealtimeData';

export function MatchScoreUpdater({ matchId }: { matchId: string }) {
  const { match, updateScore, loading } = useScoreUpdates(matchId);

  if (!match) return null;

  return (
    <div>
      <p>{match.team_a} {match.score_a} - {match.score_b} {match.team_b}</p>
      <button 
        onClick={() => updateScore(3, 2)}
        disabled={loading}
      >
        {loading ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
    </div>
  );
}
```

### Exemple 3: Effectuer une Mutation

```tsx
import { useMutation } from '@/hooks/useRealtimeData';
import { endpoints } from '@/services/api';

interface CreatePredictionInput {
  match_id: string;
  predicted_winner: 'team_a' | 'team_b';
  predicted_score_a: number;
  predicted_score_b: number;
}

export function CreatePredictionForm() {
  const { mutate, loading, error } = useMutation<CreatePredictionInput, any>('post');

  const handleSubmit = async (data: CreatePredictionInput) => {
    try {
      const result = await mutate(endpoints.createPrediction, data);
      console.log('Prédiction créée:', result);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ /* data */ });
    }}>
      {/* form fields */}
      <button disabled={loading}>{loading ? 'Envoi...' : 'Prédire'}</button>
      {error && <p style={{color: 'red'}}>{error.message}</p>}
    </form>
  );
}
```

## 🔌 Intégration Backend (Prono-API)

### 1. Ajouter les Endpoints

```typescript
// GET /api/matches
// GET /api/matches/:id
// PUT /api/matches/:id
// PUT /api/matches/:id/score
// GET /api/predictions
// POST /api/predictions
// PUT /api/predictions/:id
// GET /api/groups
// GET /api/groups/:id/leaderboard
```

### 2. Connecter à Convex

Remplacer les TODO dans `packages/prono-api/src/index.ts`:

```typescript
app.put('/api/matches/:id/score', async (c) => {
  const id = c.req.param('id')
  const { score_a, score_b } = await c.req.json()
  
  // TODO: Utiliser Convex pour mettre à jour le match
  const updatedMatch = await convex.mutation(api.matches.updateScore, {
    matchId: id,
    scoreA: score_a,
    scoreB: score_b
  })
  
  // TODO: Broadcaster l'event WebSocket
  broadcastEvent(`match:${id}:updated`, updatedMatch)
  
  return c.json({ success: true, data: updatedMatch })
})
```

### 3. Implémenter les WebSocket Events

```typescript
// Exemples d'events à envoyer depuis l'API

// Quand un match est mis à jour
{
  "type": "match:${matchId}:updated",
  "data": { id, team_a, team_b, score_a, score_b, status }
}

// Quand les prédictions changent
{
  "type": "predictions:updated",
  "data": { /* predictions array */ }
}

// Quand le classement change
{
  "type": "group:${groupId}:leaderboard:updated",
  "data": { /* leaderboard array */ }
}
```

## 📊 Flux de Données

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│  Components → useRealtimeData ↔ RealtimeProvider        │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │        API Client (src/services/api.ts)        │   │
│  ├─────────────────────────────────────────────────┤   │
│  │  HTTP Client  │  WebSocket Client              │   │
│  │  ├─ GET       │  ├─ connect()                  │   │
│  │  ├─ POST      │  ├─ subscribe(type, cb)       │   │
│  │  ├─ PUT       │  ├─ send(type, data)          │   │
│  │  └─ DELETE    │  └─ disconnect()               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
           ↓ HTTP ↓           ↓ WebSocket ↓
┌─────────────────────────────────────────────────────────┐
│              Backend (Hono/Prono-API)                   │
├─────────────────────────────────────────────────────────┤
│  Routes:                                                │
│  GET    /api/matches                                    │
│  PUT    /api/matches/:id/score                          │
│  POST   /api/predictions                                │
│  WS     /ws                                             │
│                                                          │
│  Connected to: Convex Database                          │
└─────────────────────────────────────────────────────────┘
```

## 🧪 Testing

### Tester le SSR

```bash
cd packages/prono-front
pnpm run build
pnpm run preview
```

### Tester l'API

```bash
# En développement
cd packages/prono-api
pnpm run dev

# Test du endpoint
curl http://localhost:3001/api/matches
```

### Tester WebSocket

```javascript
// Dans la console du navigateur
const ws = new WebSocket('ws://localhost:3001/ws');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 🐛 Troubleshooting

### ❌ WebSocket ne se connecte pas
- Vérifier `VITE_WS_URL` dans `.env.local`
- Vérifier que l'API écoute sur le bon port
- Vérifier les CORS si derrière un proxy
- Voir `useRealtime().connected` dans React DevTools

### ❌ Données ne se synchronisent pas
- Vérifier les events WebSocket envoyés par l'API
- Vérifier le type d'event dans `useRealtimeData(endpoint, eventType)`
- Vérifier que les données respectent la structure attendue

### ❌ SSR ne compile pas
- Vérifier que `entry.server.tsx` existe
- Vérifier `react-router.config.ts`
- Vérifier les imports dans `main.tsx`

## 📚 Documentation Supplémentaire

- React Router v7 SSR: https://reactrouter.com/start/ssr
- Hono Framework: https://hono.dev
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

## 🎉 Prochaines Étapes

1. ✅ Configurer les endpoints API dans prono-api
2. ✅ Intégrer Convex pour la persistance
3. ✅ Implémenter les WebSocket events
4. ✅ Tester la synchronisation temps réel
5. ✅ Déployer en production
