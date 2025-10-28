# prono-api-public

API publique pour récupérer les données de matches depuis la base de données PostgreSQL.

## Configuration

### Variables d'environnement

Le fichier `.env` doit contenir :

```
DATABASE_URL="postgresql://[user]:[password]@[host]:[port]/[database]"
```

Exemple :
```
DATABASE_URL="postgresql://admin:CG0z30T@uW3!9O@u2ZHL@88.223.95.27:32774/matches"
```

## Installation et démarrage

```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev

# Construire pour la production
pnpm build

# Démarrer en production
pnpm start
```

## Routes disponibles

### 1. Health Check
- **Route**: `GET /`
- **Description**: Vérifier que l'API est en fonctionnement
- **Réponse**:
```json
{
  "message": "API Public is running"
}
```

### 2. Récupérer tous les matches
- **Route**: `GET /matches`
- **Description**: Retourne tous les matches stockés en base de données, triés par date décroissante
- **Réponse** (exemple):
```json
[
  {
    "id": "match_001",
    "team_a": "Team A",
    "team_b": "Team B",
    "team_a_logo": "https://...",
    "team_b_logo": "https://...",
    "match_date": "2025-10-28T14:00:00.000Z",
    "tournament": "League Cup",
    "status": "completed",
    "winner": "Team A",
    "score_a": 2,
    "score_b": 1,
    "created_date": "2025-10-28T10:00:00.000Z",
    "updated_date": "2025-10-28T14:30:00.000Z",
    "created_by_id": "user_123",
    "created_by": "Admin",
    "is_sample": false
  }
]
```

### 3. Récupérer un match spécifique
- **Route**: `GET /matches/:id`
- **Description**: Retourne un match spécifique par son ID
- **Paramètres**:
  - `id` (string): L'ID du match
- **Réponse**: Un objet match (voir exemple ci-dessus)
- **Erreurs**:
  - `404`: Match non trouvé
  - `500`: Erreur serveur

## Gestion de la base de données

### Importer le schéma existant

```bash
pnpm exec prisma db pull
```

### Générer le client Prisma

```bash
pnpm exec prisma generate
```

### Modèle Prisma

Le schéma `matches` contient les champs suivants :
- `id`: Identifiant unique (String)
- `team_a`: Nom de l'équipe A (String)
- `team_b`: Nom de l'équipe B (String)
- `team_a_logo`: URL du logo de l'équipe A (String)
- `team_b_logo`: URL du logo de l'équipe B (String)
- `match_date`: Date du match (DateTime)
- `tournament`: Nom du tournoi (String)
- `status`: Statut du match (String)
- `winner`: Équipe gagnante (String)
- `score_a`: Score de l'équipe A (Int)
- `score_b`: Score de l'équipe B (Int)
- `created_date`: Date de création (DateTime)
- `updated_date`: Date de dernière modification (DateTime)
- `created_by_id`: ID du créateur (String)
- `created_by`: Nom du créateur (String)
- `is_sample`: Indicateur d'exemple (Boolean)

## Stack technologique

- **Framework**: Hono
- **ORM**: Prisma
- **Base de données**: PostgreSQL
- **Runtime**: Node.js
