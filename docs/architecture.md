## Architecture cible Diag360

### Vue d’ensemble

```
┌─────────────┐     HTTPS      ┌──────────────┐        SQL / REST        ┌──────────────┐
│  Front-end  │ ─────────────▶ │  API Python  │ ───────────────────────▶ │   PostgreSQL │
│ (Vite/React)│ ◀───────────── │  (FastAPI)   │ ◀──────────────┐        │ (diag360_db) │
└─────────────┘   JSON (REST)  └──────┬───────┘              │          └──────┬───────┘
                                      │                      │                 │
                                      │                      │                 │
                                      │          CLI scoring scripts           │
                                     │   (ingest_workbook, need_scores, etc.) │
                                     │                                         │
                                      │                                         │
                                      ▼                                         │
                             ┌────────────────┐                                 │
                             │  Report CLI & │                                 │
                             │ calc scripts  │                                 │
                             └──────┬────────┘                                 │
                                    │                                           │
                                    │  Read-only                                │
                                    ▼                                           │
                              ┌──────────────┐                                   │
                              │   NocoDB     │ ◀─────────────────────────────────┘
                              │ (admin UI)   │  direct SQL (managed schema)
                              └──────────────┘
```

### Composants

1. **Front-end (dossier `front/`)**
   - Vite + React + Tailwind.
   - Consomme uniquement l’API interne via `VITE_API_BASE_URL`.
   - Deux usages :
     - Consulter les scores existants pour chaque EPCI.
     - Soumettre un formulaire *Diagnostic Flash* : les données sont utilisées pour calculer un rapport et sont immédiatement supprimées côté navigateur (elles ne quittent pas la mémoire vive du backend).

2. **API Python (`backend/`)**
   - FastAPI + SQLAlchemy.
   - Routes principales :
     - `GET /api/territories` : liste paginée + filtres.
     - `GET /api/territories/search?term=` : auto-complétion.
     - `GET /api/territories/{code_siren}` : fiche détaillée.
     - `POST /api/reports/flash` : calcule un rapport temporaire en mémoire.
     - `POST /api/ingest/xlsx` (CLI) : charge les données brutes issues du fichier Excel fourni.
   - Gère la connexion PostgreSQL et expose un service de calcul (placeholder) pour préparer l’arrivée des scripts Python définitifs.

3. **Base de données PostgreSQL (`diag360_db`)**
   - Schéma `public` : table `territories` consommée par l’API actuelle.
   - Schéma `diag360_ref` : référentiel issu de `Diag360_EvolV2.xlsx` (besoins, indicateurs, objectifs, types, vues de synthèse).
   - Schéma `diag360_raw` : données brutes des onglets Excel (EPCI, valeurs, scores, règles de transformation).
   - dbt pourra consommer ces schémas pour bâtir `stg_` et `mart_`.
   - Scripts SQL dans `docker/postgres/init/001_*.sql` et `002_create_diag360_schema.sql`.
   - Schéma relationnel documenté dans `Diag360_schema.svg` (remplace l’ancien MCD Draw.io).

4. **NocoDB**
   - Connecté en lecture/écriture au même PostgreSQL (service `nocodb` dans `docker-compose.yml`).
   - Projects recommandés : exposer `public`, `diag360_ref`, `diag360_raw` pour piloter le référentiel et contrôler les imports.
   - Sécurité : variables `NOCODB_JWT_SECRET`, `NOCODB_EMAIL`, `NOCODB_PASSWORD`; prévoir VPN ou proxy authentifié.
   - Guide d’usage détaillé dans `docs/nocodb.md`.

5. **Calculs Python & rapports**
   - Dossier `backend/app/cli` : `ingest_workbook.py`, `compute_need_scores.py`, `fetch_external_data.py`.
   - `scripts/run_pipeline.sh` orchestre les étapes (`up`, `ingest`, `need-scores`, `fetch`, etc.).
   - `backend/app/calculations` accueillera les scripts métiers (ex: génération de rapports flash).

### Flux de données

| Étape | Description | Stockage |
|-------|-------------|----------|
| Ingestion brute (one-shot) | Lancer `docker compose run --rm --profile ingest backend_ingest --file /data/Diag360_EvolV2.xlsx` pour peupler `diag360_ref` + `diag360_raw` une seule fois (le service n’est pas démarré par défaut). | `diag360_ref`, `diag360_raw` |
| Calcul des scores besoins | `python -m app.cli.compute_need_scores --data-year 0` agrège les scores indicateurs / besoins et alimente `diag360_raw.need_scores`. | `diag360_raw.need_scores` |
| Publication | FastAPI lit `diag360_raw.need_scores` et expose les scores au front. | `diag360_raw.need_scores` |
| Diagnostic Flash | L’utilisateur saisit des données supplémentaires. FastAPI calcule un rapport en mémoire et renvoie un PDF/JSON (actuellement JSON). | **Aucune persistance** |

### Diagramme relationnel

Le fichier `Diag360_schema.svg` (racine du dépôt) illustre les tables clés des schémas `diag360_ref`, `diag360_raw` et leurs relations. Ouvrir dans n’importe quel lecteur SVG (ou tirer dans Draw.io si besoin d’édition).

### Intégration des calculs de scoring

- Le dépôt externe `Guillaume-BR/diag360` reste une source d’inspiration pour les calculs métier (scripts, notebooks). Les extractions utiles pourront être intégrées dans `backend/app/calculations/` ou via `app/cli/fetch_external_data.py`.
- Les transformations sont désormais codées directement en SQLAlchemy/Python, garantissant une compréhension simple du pipeline : ingestion → tables brutes → calcul `need_scores`.

### Docker / DevOps

`docker-compose.yml` orchestre 4 services :

1. `frontend` – build Vite, exposé uniquement sur le réseau interne (reverse proxy Caddy).
2. `backend` – FastAPI + Uvicorn (`:8000` exposé en interne).
3. `db` – PostgreSQL 15, volume persistant `SHARED_DATA_ROOT`.
4. `nocodb` – accessible via reverse proxy (internal port `8080`).

Fichier `.env` à la racine :
```
POSTGRES_USER=diag360
POSTGRES_PASSWORD=diag360pwd
POSTGRES_DB=diag360
DATABASE_URL=postgresql+psycopg://diag360:diag360pwd@db:5432/diag360
NOCODB_JWT_SECRET=change-me
NOCODB_PORT=8081
BACKEND_PORT=8000
FRONTEND_PORT=5173
VITE_API_BASE_URL=http://localhost:8000/api
```

### Déploiement sur VPS

1. Installer Docker & docker-compose plugin.
2. Copier le dépôt sur la machine.
3. Configurer les variables sensibles dans `.env`.
4. `docker compose up --build -d`.
5. Configurer un reverse proxy (Traefik, Caddy, Nginx) pour exposer `frontend` et `backend` via HTTPS. NocoDB peut rester derrière un VPN ou une authentification forte.

### Points d’attention

1. **Sécurité NocoDB** : restreindre l’accès (VPN / IP allowlist) car l’outil modifie directement la base.
2. **Formulaire non persistant** : les données du formulaire ne doivent jamais être insérées dans PostgreSQL. Le backend retourne simplement un rapport généré en mémoire.
3. **dbt & scripts Python** : prévoir des tests unitaires pour les macros et transformations sensibles. dbt reste adapté (versionnement, documentation, lineage). Les scripts Python peuvent appeler `dbt run` avant d’exécuter leurs propres calculs si nécessaire.
4. **Fichier Excel initial** : stocker dans un bucket privé ou un volume monté sur le VPS. Le script CLI prend le chemin en argument.

Ce document sert de référence pour l’équipe produit/tech : il décrit la cible ainsi que les conventions (noms de tables, endpoints, flux). Toute évolution majeure devra être répercutée ici.
