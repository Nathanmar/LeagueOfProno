# Guide de Migration de mockData vers l'API

Ce guide explique comment migrer progressivement votre application de `mockData` vers l'API (Convex via prono-api).

## Architecture

```
mockData.ts (données statiques)
    ↓
dataAdapter.ts (convertit Convex → types front)
    ↓
dataService.ts (appels API + adaptation)
    ↓
useData.ts (hooks React pour composants)
    ↓
Vos composants React
```

## Étapes de migration

### 1. Remplacer les imports simples

**Avant (mockData):**
```typescript
import { matches, groups, predictions, users, currentUser } from "../data/mockData";

export function Dashboard() {
  return (
    <div>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

**Après (API):**
```typescript
import { useMatches } from "../hooks/useData";

export function Dashboard() {
  const { data: matches, loading, error } = useMatches();

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {matches?.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

### 2. Hooks disponibles

#### Matches
```typescript
// Tous les matchs
const { data: matches, loading, error, refetch } = useMatches();

// Un match spécifique
const { data: match } = useMatch(matchId);
```

#### Groupes
```typescript
// Tous les groupes
const { data: groups } = useGroups();

// Un groupe spécifique
const { data: group } = useGroup(groupId);

// Classement d'un groupe
const { data: leaderboard } = useGroupLeaderboard(groupId);

// Utilisateurs d'un groupe
const { data: users } = useGroupUsers(groupId);
```

#### Prédictions
```typescript
// Toutes les prédictions
const { data: predictions } = usePredictions();

// Prédictions d'un utilisateur
const { data: userPreds } = useUserPredictions(userId);

// Prédictions d'un match
const { data: matchPreds } = useMatchPredictions(matchId);
```

#### Utilisateurs
```typescript
// Utilisateur courant
const { data: currentUser } = useCurrentUser();

// Un utilisateur spécifique
const { data: user } = useUser(userId);
```

### 3. Service direct (sans hooks)

Si vous devez utiliser le service directement dans un contexte non-React:

```typescript
import { 
  fetchMatches,
  fetchGroups,
  fetchPredictions,
  fetchCurrentUser,
  fetchGroupById,
  createPrediction
} from "../services/dataService";

// Utilisation
const matches = await fetchMatches();
const groups = await fetchGroups();
const predictions = await fetchPredictions();

// Créer une prédiction
const newPred = await createPrediction({
  user_id: "user123",
  match_id: "match456",
  group_id: "group789",
  predicted_winner: "team_a",
  predicted_score_a: 3,
  predicted_score_b: 1,
  points_earned: 0,
  is_correct: false,
  is_exact_score: false
});
```

### 4. Utiliser mockData en fallback

Pour une transition progressive, vous pouvez d'abord garder mockData comme fallback:

```typescript
import * as mockData from "../data/mockData";
import { useMatches } from "../hooks/useData";

export function Dashboard() {
  const { data: apiMatches, loading } = useMatches();
  // Utiliser l'API si disponible, sinon mockData
  const matches = apiMatches ?? mockData.matches;

  return (
    <div>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

## Types de données

Les types mockData sont réutilisés:

```typescript
import type { Match, Group, Prediction, User } from "../data/mockData";

// Tous les types sont compatibles avec l'API adaptée
```

## Gestion des erreurs

```typescript
export function DashboardWithErrorHandling() {
  const { data: matches, loading, error, refetch } = useMatches();

  if (error) {
    return (
      <div className="error-container">
        <p>Erreur: {error.message}</p>
        <button onClick={refetch}>Réessayer</button>
      </div>
    );
  }

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      {matches?.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

## Mise en cache

Les hooks utilisent `useState` et `useEffect` pour gérer la mise en cache. Pour une mise en cache plus avancée, considérez:

- React Query (TanStack Query)
- SWR
- Zustand pour un state management global

## Variables d'environnement

Assurez-vous que votre `.env` contient:

```
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

## Composants à migrer en priorité

1. **Dashboard.tsx** - Récupère matches et predictions
2. **GroupView.tsx** - Récupère groupes et leaderboard
3. **Leaderboard.tsx** - Utilise leaderboard API
4. **Profile.tsx** - Récupère predictions utilisateur
5. **MatchPredictionsModal.tsx** - Affiche prédictions du match

## Fichiers créés

- `dataAdapter.ts` - Convertit Convex → types front
- `dataService.ts` - Service API
- `useData.ts` - Hooks React
- `MIGRATION_GUIDE.md` (ce fichier)
