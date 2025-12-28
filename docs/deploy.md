# Déploiement & pipeline

## Prérequis

1. Copier le dépôt sur le VPS (`/srv/docker/shared/diag360` par exemple).
2. Renseigner `.env` (copie depuis `.env.example`) avec les secrets Postgres, NocoDB, etc.
3. Vérifier que Docker et le plugin Compose sont installés.

## Script `scripts/run_pipeline.sh`

Ce script centralise les commandes `docker compose` courantes.

```
Usage: scripts/run_pipeline.sh <commande> [options]

Commandes principales :
  up                     Démarre les services (mode détaché).
  down                   Stoppe et supprime les services.
  logs                   Suit les logs backend, frontend, nocodb.
  ingest [fichier]       Lance l’ingestion XLSX (défaut: ./Diag360_EvolV2.xlsx).
  need-scores [année]    Calcule les scores besoins (défaut: 0).
  fetch <url>            Appelle un endpoint JSON externe via le CLI backend.
  shell                  Ouvre un shell interactif dans le conteneur backend.

Variables d’environnement :
  COMPOSE_COMMAND        Par défaut `docker compose`.
  DATA_FILE              Fichier XLSX par défaut pour `ingest`.
  DATA_YEAR              Année par défaut pour `need-scores`.
```

Exemples :

```bash
# Construire et démarrer les services
./scripts/run_pipeline.sh up --build

# Importer un classeur spécifique
DATA_FILE=/srv/data/Diag360_EvolV3.xlsx ./scripts/run_pipeline.sh ingest

# Recalculer les scores besoins pour l’année 2023
./scripts/run_pipeline.sh need-scores 2023

# Tester un fetch JSON
./scripts/run_pipeline.sh fetch https://api.exemple.org/indicateurs
```

## Reverse proxy (Caddy)

Voir `docs/caddy.md` pour les blocs `serv1.diag360.org` (frontend) et
`nocodb.diag360.org`. Après toute modification :

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

## Séquence type

1. `./scripts/run_pipeline.sh up --build`
2. `./scripts/run_pipeline.sh ingest /srv/data/Diag360_EvolV2.xlsx`
3. `./scripts/run_pipeline.sh need-scores 0`
4. Configurer/valider les routes Caddy.
5. Vérifier les services (`./scripts/run_pipeline.sh logs`).
