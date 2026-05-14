# Système d'emprunt de matériel — BDS Totally Sport (back)

Back du système d'emprunt de matériel du BDS Télécom Paris, réalisé dans le cadre du défi pôle WEB de la campagne BDS pour la liste Totally Sport.

> Le code du front se trouve dans le repo voisin `emprunt-front` (Next.js + Tailwind).

## Stack

- NestJS (TypeScript)
- Prisma + PostgreSQL
- OAuth2 / OIDC via Rezel (Authentik)

## Cahier des charges

- Authentification Rezel
- Gestion des permissions sur la BDD (rôles `USER` / `ADMIN`)
- Espace administrateur
- Espace cotisant pour emprunter
- CRUD du matériel avec upload de photo
- Demande d'emprunt avec calendrier (jours déjà réservés barrés)
- Validation des chevauchements de période côté serveur
- Workflow demande → accept/refus admin → suivi → marquage de retour
- Notifications email (réponse à la demande, rappel le jour de fin)
- Historique complet (admin) filtrable, historique perso (cotisant)
- Locations en cours triées par date de retour, retards en rouge

### Fonctionnalités implémentées

#### Cotisants

- Authentification via Rezel.
- Visualisation du matériel disponible et de ses emprunts en cours/à venir.
- Demande d'emprunt avec sélection de la période souhaitée (calendrier).
- Historique de ses demandes d'emprunt avec statut (en attente, accepté, refusé).
- Recevoir un mail de la réponse de l'emprunt (accepté/refusé) et un mail de rappel le jour de fin de l'emprunt.

#### Administrateurs

- Gestion du matériel : création, édition, suppression (avec upload de photo).
- Visualisation des demandes d'emprunt en attente avec possibilité d'accepter ou refuser.
- Visualisation de l'historique complet des emprunts.
- Visualisation des emprunts en cours avec indication des retards (emprunts dépassant la date de fin).

### Architecture des modules

```
src/
├── auth/            # OAuth Rezel, JWT, guards
│   └── rezel/       # service d'échange OAuth
├── users/           # findOrCreate à la connexion, promotion admin
├── material/        # CRUD matériel + upload de photo
├── emprunt/         # demande, validation, retour, rappels mail
├── mail/            # nodemailer
├── prisma/          # PrismaService global
├── common/          # interceptor de logs HTTP, helpers
└── config/          # validation des env vars au démarrage
```

### Routes exposées

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/auth/login` | Public | Retourne l'URL d'autorisation Rezel |
| GET | `/auth/callback` | Public | Callback OAuth — pose le cookie JWT et redirige vers le front |
| GET | `/auth/me` | Connecté | Infos de l'utilisateur courant (depuis la BDD, rôle à jour) |
| POST | `/auth/logout` | Connecté | Supprime le cookie JWT |
| PATCH | `/users/:id/admin` | Connecté | Promeut un utilisateur admin (voir limites) |
| GET | `/material` | Connecté | Liste du matériel |
| GET | `/material/:id` | Connecté | Détail d'un matériel |
| POST | `/material` | Admin | Création |
| PATCH | `/material/:id` | Admin | Modification |
| DELETE | `/material/:id` | Admin | Suppression |
| POST | `/material/:id/photo` | Admin | Upload d'une photo (multipart, max 10 Mo) |
| POST | `/emprunt` | Connecté | Demande d'emprunt (vérifie le chevauchement) |
| GET | `/emprunt/mine` | Connecté | Mes demandes |
| GET | `/emprunt/blocked/:materialId` | Connecté | Plages bloquées (pour calendrier) |
| GET | `/emprunt` | Admin | Toutes les demandes |
| PATCH | `/emprunt/:id/approve` | Admin | Validation + mail au demandeur |
| PATCH | `/emprunt/:id/reject` | Admin | Refus + mail au demandeur |
| PATCH | `/emprunt/:id/return` | Admin | Marque comme rendu |

### Modèle de données

```
User     { id, email, username, name, role: USER|ADMIN }
Material { id, name, description, photoUrl? }
Emprunt  { id, userId, materialId, startDate, endDate,
           status: PENDING|APPROVED|REJECTED, returnedAt?, createdAt }
```

### Notifications email

- Mail automatique à l'utilisateur à l'**acceptation** ou au **refus** de sa demande
- Cron quotidien (8h) qui envoie un **rappel le jour du retour** à chaque utilisateur concerné

## Limites connues

- Pas de système de caution/dépôt de garantie.
- Pas de notifications pour les administrateurs (ex. lorsqu'une nouvelle demande est faite).
- Pas de filtre/recherche sur la liste de matériel.
- Pas de pagination sur les historiques.
- Le rafraîchissement du token JWT n'est pas implémenté ; après 1 h le cookie expire et il faut se reconnecter.
- Pour la simplicité du projet tous les utilisateurs sont considérés comme des cotisants

## Sécurité

- OAuth2 via Rezel pour l'authentification, avec vérification du token côté serveur.
- JWT stocké en cookie httpOnly pour les sessions.
- Route protégée côté client : redirection vers la page de connexion si non authentifié, message d'erreur si accès à une page admin sans les droits.

> ATTENTION : dans le cadre de test du projet la route `PATCH /users/:id/admin` permet à n'importe quel utilisateur connecté de devenir administrateur.  Pour une utilisation réelle, il faudrait implémenter un système pour qu'un premier utilisateur admin puisse ajouter les autres administrateurs.

## Variables d'environnement

```
# BDD
DATABASE_URL=postgresql://user:pwd@localhost:5432/emprunt

# JWT
JWT_SECRET= # `openssl rand -hex 64`

# Rezel
REZEL_AUTH_URL=https://auth.garezeldap.rezel.net/application/o/authorize/
REZEL_TOKEN_URL=https://auth.garezeldap.rezel.net/application/o/token/
REZEL_USERINFO_URL=https://auth.garezeldap.rezel.net/application/o/userinfo/
REZEL_CLIENT_ID=...
REZEL_CLIENT_SECRET=...
REZEL_CALLBACK_URL=http://localhost:3000/auth/callback

# Front
FRONTEND_URL=http://localhost:3001

# Cookie (prod uniquement)
NODE_ENV=production
COOKIE_DOMAIN=.totally-sport.fr

# SMTP 
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
SMTP_FROM=emprunt@totally-sport.fr
```

## Lancer le projet

### Base de données

Postgres via Docker :

```bash
docker run --name bds-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=emprunt \
  -p 5432:5432 \
  -d postgres
```

### Backend

```bash
npm install
npx prisma generate
npx prisma migrate dev               # applique les migrations
npm run seed                         # ajoute du matériel d'exemple
npm run start:dev                    # → http://localhost:3000
```

Documentation API auto-générée Swagger : http://localhost:3000/api


## Auteurs

- Eva Herson
- Gabriel Sabot