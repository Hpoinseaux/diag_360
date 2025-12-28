# NocoDB — Diag360

Ce guide explique comment connecter et utiliser NocoDB avec la base PostgreSQL provisionnée par `docker-compose`.

## 1. Démarrage des services

```bash
docker compose up -d db backend frontend nocodb
```

La variable d'environnement `NC_DB` dans `docker-compose.yml` pointe déjà vers PostgreSQL (`diag360`/`diag360pwd`).

## 2. Connexion initiale

1. Ouvrir `http://localhost:8081` (ou l'URL publique configurée).
2. Se connecter avec les identifiants définis dans `.env` (`NOCODB_EMAIL`, `NOCODB_PASSWORD`).
3. À la première connexion, NocoDB détectera automatiquement la base `diag360`. Choisir **Use Existing** pour éviter de recréer une nouvelle connexion.

## 3. Organisation recommandée

| Schéma | Contenu | Usage NocoDB |
|--------|---------|---------------|
| `public` | Table `territories` (API actuelle) | Lecture seule pour vérification rapide. |
| `diag360_ref` | Besoins, indicateurs, objectifs, types, vues de synthèse | Full CRUD pour piloter le référentiel métier. |
| `diag360_raw` | Tables "Table EPCI", valeurs, scores, règles de transformation | Édition contrôlée. Conserver l'historique des imports Excel. |

### Étapes dans NocoDB

1. Dans le workspace créé par défaut, cliquer sur **Create Project** ▶ **Existing DB**.
2. Sélectionner la connexion `diag360`.
3. Choisir les schémas à exposer (au minimum `diag360_ref`, `diag360_raw`, `public`).
4. Pour chaque table :
   - Renommer les vues pour refléter leurs usages (ex. `Référentiel > Besoins`).
   - Configurer les formules / relations (ex. `indicator_need_links.indicator_id → indicators.id`).
   - Ajouter des filtres pour masquer les colonnes techniques (`created_at`, `updated_at`) si nécessaire.

### Permissions

- Créer au moins 2 rôles :
  - **Admin** : accès complet aux schémas `diag360_ref` & `diag360_raw`.
  - **Lecture** : accès en lecture seule pour les partenaires.
- Utiliser les **Shared Views** pour publier un sous-ensemble de données sans exposer la totalité de la base.

## 4. Synchronisation avec les imports Excel

1. Exécuter l'ingestion (CLI ou futur script) pour alimenter `diag360_ref` et `diag360_raw`.
2. Rafraîchir NocoDB : les nouvelles lignes sont visibles instantanément.
3. Éviter de modifier manuellement les colonnes calculées (ex: `indicator_scores.score`). Privilégier les colonnes descriptives ou les tables de correspondance.

## 5. Points d'attention

- Changer `NOCODB_JWT_SECRET`, `NOCODB_EMAIL`, `NOCODB_PASSWORD` avant toute mise en ligne.
- Restreindre l'accès (VPN ou reverse proxy avec authentification) : NocoDB a des droits d'écriture sur toute la base.
- En production, monter un volume Docker pour `/usr/app/data` afin de conserver la configuration NocoDB (tables, vues, rôles).
