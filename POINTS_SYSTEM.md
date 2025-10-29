# 📊 Système de Gestion des Points - Documentation

## 🎯 Problème Identifié

**Question:** "Pourquoi j'ai prediction échoué quand le gagnant et le score correspondent?"

**Réponse:** Les points **ne sont pas calculés automatiquement**. Ils restent à `0` jusqu'à ce qu'on appelle explicitement la route de calcul.

### Données d'exemple :
```json
{
  "predicted_winner": "team_a",    // ✅ Correct
  "predicted_score_a": 4,           // ✅ Correct
  "predicted_score_b": 2,           // ✅ Correct
  "is_correct": null,               // ❌ Pas calculé
  "is_exact_score": null,           // ❌ Pas calculé
  "points_earned": 0                // ❌ Zéro par défaut
}
```

---

## ✅ Solution Implémentée

### **1. Hook Automatique : `useMatchPointsCalculation`**

Ce hook surveille les matchs et calcule automatiquement les points quand un match change de statut à "finished".

**Fichier:** `/packages/prono-front/app/hooks/useMatchPointsCalculation.ts`

**Fonctionnement:**
```typescript
// Chaque fois que la liste des matchs change
useMatchPointsCalculation(matches, onPointsCalculated);

// Le hook :
// 1. Détecte les matchs avec status = "finished"
// 2. Appelle POST /api/matches/:matchId/calculate-points
// 3. Exécute le callback onPointsCalculated() si points calculés
```

### **2. Route Backend : `POST /api/matches/:matchId/calculate-points`**

**Fichier:** `/packages/prono-api-private/src/index.ts`

**Logique:**
```
Pour chaque prédiction du match:
  1. Récupère les résultats finaux (result_score_a, result_score_b)
  2. Détermine le gagnant réel
  3. Compare avec la prédiction:
     - Si gagnant correct: +3 pts
     - Si score exact: +2 pts bonus (total 5 pts)
     - Si incorrect: 0 pts
  4. Met à jour is_correct, is_exact_score, points_earned
```

### **3. Service Frontend : `calculateMatchPoints`**

**Fichier:** `/packages/prono-front/app/services/matchesService.ts`

```typescript
// Appel la route backend
const { error, updated } = await calculateMatchPoints(matchId);
// Retourne le nombre de prédictions mises à jour
```

---

## 🔄 Flux de Calcul des Points

### **Avant (Manuel):**
```
Match créé → Prédiction sauvegardée (0 pts) → [Attente manuelle]
```

### **Après (Automatique):**
```
1. Match créé
   ↓
2. Prédiction sauvegardée (0 pts par défaut)
   ↓
3. Match passe à status "finished"
   ↓
4. Hook détecte le changement
   ↓
5. Appel POST /api/matches/:matchId/calculate-points
   ↓
6. Calcul des points sur le serveur
   ↓
7. Prédiction mise à jour (is_correct, is_exact_score, points_earned)
   ↓
8. Callback: reloadPredictionsAndStats()
   ↓
9. Rechargement des prédictions et statistiques du frontend
   ↓
10. UI mise à jour avec les nouveaux points ✅
```

---

## 📈 Exemple Concret

**Données reçues:**
- Prédiction: team_a, 4-2 ✅
- Résultat: team_a, 4-2 ✅

**Avant calcul:**
```json
{
  "predicted_winner": "team_a",
  "predicted_score_a": 4,
  "predicted_score_b": 2,
  "is_correct": null,
  "is_exact_score": null,
  "points_earned": 0
}
```

**Après calcul automatique:**
```json
{
  "predicted_winner": "team_a",
  "predicted_score_a": 4,
  "predicted_score_b": 2,
  "is_correct": true,           // ✅ Calculé
  "is_exact_score": true,       // ✅ Calculé
  "points_earned": 5            // ✅ 3 + 2 bonus
}
```

---

## 🎯 Système de Points

| Résultat | Points |
|----------|--------|
| Prédiction incorrecte | 0 pts |
| Gagnant correct, mauvais score | 3 pts |
| Gagnant correct + score exact | 5 pts (3 + 2 bonus) |

---

## 📱 Intégration dans GroupView

```typescript
// 1. Hook détecte les changements de matchs
useMatchPointsCalculation(matches, reloadPredictionsAndStats);

// 2. Callback rechargement après calcul
const reloadPredictionsAndStats = async () => {
  // Recharge les prédictions
  const { predictions } = await getGroupPredictions(groupId);
  setPredictions(predictions);
  
  // Recharge les statistiques
  const { stats } = await getUserGroupStats(groupId);
  setUserStats(stats);
};

// 3. UserStatsCard affiche les points totaux
<UserStatsCard stats={userStats} />
```

---

## 🚀 Avantages

✅ **Automatique:** Pas besoin d'appeler manuellement une API
✅ **Temps réel:** Mis à jour tous les 10s avec les nouveaux matchs
✅ **Réactif:** UI mise à jour immédiatement après calcul
✅ **Transparent:** Console logs pour déboguer
✅ **Robuste:** Gère les erreurs gracieusement

---

## 🔍 Débogage

**Console logs disponibles:**

```javascript
// Hook détecte un match finished
[POINTS_CALCULATION] Calculating points for finished match: 68ff42a97d38b853ef1a2a80

// Calcul réussi
[POINTS_CALCULATION] Points calculated for 1 predictions

// Rechargement des données
[GROUPVIEW] Prédictions reloadées après calcul de points
[GROUPVIEW] Statistiques reloadées
```

Ouvrez DevTools (F12) → Console pour suivre le calcul en temps réel.

---

## 📝 Résumé

Le système fonctionne maintenant **totalement automatiquement**:
1. Un match devient "finished"
2. Le hook le détecte
3. Les points sont calculés sur le serveur
4. Les données sont mises à jour en frontend
5. L'utilisateur voit ses points mis à jour dans la carte de statistiques

**Aucune action manuelle requise!** ✨
