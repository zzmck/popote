# Popote — version modulaire

App popote découpé en modules frontend (ES natifs facon react) => sans builder + backend en modules commonJs.
Base de donnée incorporé à l app. (Evite de devoir gérer un acces en base mongodb séparé *Inutile pour une micro app)
## Structure

```
server/
  package.json
  src/
    index.js         # point d'entrée : assemble express + ws + routes
    config.js         # variables d'environnement
    db.js              # connexion SQLite, schéma, migrations
    crypto.js          # hash/vérification des mots de passe
    serializers.js     # row -> JSON (*La sortie)
    auth.js             # findActor, permissions, middlewares
    state.js            # resolveScope + snapshot d'état renvoyé au front
    ws.js                # WebSocket (signal de rafraîchissement uniquement)
    routes/             # un routeur Express par ressource
      state.js, authRoutes.js, popotiers.js, config.js, onboarding.js,
      popotes.js, products.js, members.js, transactions.js, cash.js, shopping.js

client/
  index.html            # coquille HTML (Tailwind CDN + styles)
  src/
    main.js             # point d'entrée : boot() + écoute des événements
    render.js            # fonction de rendu principale
    events.js            # délégation d'événements (click/change/submit)
    state/store.js       # State global + constantes (CATS, FRIDGE_CATS, BOTTLE_CATS)
    utils/               # format.js (fmt/esc/...), toast.js
    services/            # api.js, state.js (fetchState/applyState/WS), popoteSession.js
    domain/selectors.js  # sélecteurs dérivés de State (balance, financeSummary, ...)
    actions/             # écritures API par domaine (products, members, cash, shopping, ...)
    ui/                   # kit UI partagé : styles Tailwind (styles.js), champs de formulaire (fields.js),
                          # modale générique pilotée par props (formModal.js), AddButton, StatCard
    modals/              # une modale (ou un petit groupe de modales liées) par fichier, construites via ui/formModal.js
    components/          # topBar/bottomNav, écrans no-db/no-popote, ligne d'historique
    pages/                # viewMenu, viewCompte, viewStats
    pages/admin/          # viewAdmin + sous-onglets (popotes, produits, membres, caisse, courses, popotiers, réglages)

Dockerfile, docker-compose.yml, k8s/popote.yaml  # adaptés aux chemins (client/, server/src/index.js)
```

## Lancer en local

```bash
cd server
npm install
DATA_DIR=/tmp/popote-data PORT=3000 node src/index.js
```

Puis ouvrir http://localhost:3000.

## Docker

```bash
docker compose up --build
```

Ne pas oublier les variables Environnement à déclarer.
