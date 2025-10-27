# SSR Configuration Guide

## Overview
Cette application React utilise **Server-Side Rendering (SSR)** avec Vite pour les performances et l'optimisation SEO.

## Architecture

### 1. Server Entry (`src/entry.server.tsx`)
- Gère le rendu côté serveur avec React 18
- Streaming de la réponse HTML pour les performances optimales
- Gestion des erreurs lors du rendu

### 2. Client Entry (`src/main.tsx`)
- Utilise `hydrateRoot` au lieu de `createRoot` pour l'hydratation
- Attache l'app React au DOM rendu côté serveur
- Initialise les providers côté client

### 3. API Client (`src/services/api.ts`)
- Communication HTTP avec `prono-api`
- WebSocket pour les mises à jour temps réel
- Reconnexion automatique avec backoff exponentiel

### 4. Hooks personnalisés (`src/hooks/useRealtimeData.ts`)
- `useRealtimeData`: Récupère les données avec synchronisation temps réel
- `useMutation`: Effectue des mutations (POST, PUT, DELETE)
- `useScoreUpdates`: Gère les mises à jour de scores

### 5. Context Provider (`src/contexts/RealtimeContext.tsx`)
- Initialise la connexion WebSocket côté client
- Fournit l'état de connexion à l'app

## Configuration

### Variables d'Environnement
Créez un fichier `.env.local` basé sur `.env.example`:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
VITE_PORT=5173
VITE_HOST=localhost
```

### Vite Config
Le plugin `reactRouter` est configuré dans `vite.config.ts` pour gérer automatiquement :
- La build SSR
- La compilation des routes
- L'optimisation des chunks

## Utilisation

### Récupérer des données avec sync temps réel

```tsx
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { endpoints } from '@/services/api';

export function MyComponent() {
  const { data, loading, error, refetch } = useRealtimeData(
    endpoints.matches,
    'matches:updated' // Event type pour les updates en temps réel
  );

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### Effectuer une mutation

```tsx
import { useMutation } from '@/hooks/useRealtimeData';
import { endpoints } from '@/services/api';

export function UpdateScoreButton() {
  const { mutate, loading } = useMutation<
    { score_a: number; score_b: number },
    Match
  >('put');

  const handleUpdate = async () => {
    try {
      const result = await mutate(endpoints.updateMatch('match_123'), {
        score_a: 3,
        score_b: 2,
      });
      console.log('Updated:', result);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <button onClick={handleUpdate} disabled={loading}>
      {loading ? 'Mise à jour...' : 'Mettre à jour le score'}
    </button>
  );
}
```

### Mettre à jour les scores en temps réel

```tsx
import { useScoreUpdates } from '@/hooks/useRealtimeData';

export function MatchScoreCard({ matchId }: { matchId: string }) {
  const { match, updateScore, loading } = useScoreUpdates(matchId);

  if (!match) return <div>Chargement du match...</div>;

  return (
    <div>
      <h3>{match.team_a} vs {match.team_b}</h3>
      <p>Score: {match.score_a} - {match.score_b}</p>
      <button
        onClick={() => updateScore(3, 2)}
        disabled={loading}
      >
        Mettre à jour le score
      </button>
    </div>
  );
}
```

## Développement

### Démarrer le serveur de dev
```bash
pnpm dev
```

### Build production
```bash
pnpm build
```

### Serveur de production
```bash
pnpm start
```

## Performance

### Optimisations activées
- ✅ Streaming HTML avec `renderToPipeableStream`
- ✅ Code splitting automatique des routes
- ✅ WebSocket pour les updates sans latence
- ✅ Reconnexion automatique en cas de déconnexion
- ✅ SWC pour la transpilation rapide

### Limitations
- SSR nécessite une API pour récupérer les données
- WebSocket peut nécessiter un proxy si derrière un load balancer
- Les données sont rechargées au démarrage côté serveur

## Intégration avec prono-api

### Structure attendue
```
prono-api
├── GET  /api/matches          - Récupérer tous les matchs
├── GET  /api/matches/:id      - Récupérer un match
├── PUT  /api/matches/:id      - Mettre à jour un match
├── GET  /api/predictions      - Récupérer les prédictions
├── POST /api/predictions      - Créer une prédiction
├── PUT  /api/predictions/:id  - Mettre à jour une prédiction
├── GET  /api/groups           - Récupérer les groupes
├── GET  /api/groups/:id/leaderboard - Classement du groupe
└── WS   /ws                   - WebSocket pour les updates
```

### Format de réponse attendu
```json
{
  "success": true,
  "data": {
    "id": "...",
    "...": "..."
  }
}
```

### Events WebSocket
```json
{
  "type": "matches:updated",
  "data": { "id": "...", "score_a": 3, "score_b": 2 }
}
```

## Troubleshooting

### WebSocket ne se connecte pas
1. Vérifier que `VITE_WS_URL` pointe vers le bon serveur
2. Vérifier les règles CORS si derrière un proxy
3. Vérifier les logs de la console du navigateur

### Données ne se synchronisent pas
1. Vérifier que l'API envoie les events WebSocket corrects
2. Vérifier le type d'event dans `useRealtimeData`
3. Vérifier la connexion WebSocket avec `useRealtime().connected`

### SSR non rendu
1. Vérifier les erreurs dans les logs du serveur
2. Vérifier que `entry.server.tsx` est valide
3. Vérifier la configuration Vite
