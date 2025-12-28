# Frontend Diag360

Application React/Vite (TypeScript + shadcn-ui) consommant l’API FastAPI (`VITE_API_BASE_URL`).

## Démarrage local

```bash
cd front
npm install
npm run dev
```

Variables utiles (fichier `.env` à la racine `front/`) :

```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Build Docker

L’image utilisée dans `docker-compose.yml` reprend le Dockerfile suivant :

```bash
docker build -t diag360-frontend .
```

## Structure

- `src/api` : client HTTP (fetch), wrappers pour territoires et rapports.
- `src/components` : UI shadcn + composants métier (radar, cartes, modales).
- `src/data` : données statiques / mocks pour démonstrations hors API.

## Déploiement

Le conteneur est relié au réseau `diag360-ntw` et servi par Caddy via `serv1.diag360.org`.
Consultez `docs/caddy.md` à la racine pour ajouter d’autres routes ou recharger Caddy.
