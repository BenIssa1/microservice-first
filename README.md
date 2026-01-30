# Hotel Booking System - Microservices Architecture

Système de réservation d'hôtel inspiré d'Airbnb, construit avec NestJS en architecture microservices.

## 📋 Table des matières

- [Architecture](#architecture)
- [Services](#services)
- [Technologies](#technologies)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Démarrage](#démarrage)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [RabbitMQ Events](#rabbitmq-events)

## 🏗️ Architecture

Le projet suit une architecture microservices avec Clean Architecture pour chaque service :

```
┌─────────────────┐
│ Traefik (:3000) │  ← Point d'entrée unique (reverse proxy)
└────────┬────────┘
         │
   ┌─────┴─────┬──────────┬──────────┬──────────────┐
   │           │          │          │              │
┌──▼──┐  ┌─────▼────┐ ┌───▼───┐  ┌───▼───┐  ┌──────▼──────┐
│Auth │  │Hotel     │ │Reser- │  │Payment│  │  RabbitMQ   │
│User │  │Reservation│ │vation│  │Notific│  │   Events    │
└──┬──┘  └─────┬────┘ └───┬───┘  └───┬───┘  └─────────────┘
   │           │          │          │
   │      ┌────▼────┐ ┌───▼───┐  ┌───▼───┐
   │      │DB Hotel │ │DB Res.│  │DB Pay.│ ...
   │      └─────────┘ └───────┘  └───────┘
```

## 🎯 Services

### 1. Traefik (Port 3000)
Reverse proxy : point d'entrée unique. Route les requêtes par préfixe de chemin (`/auth`, `/hotels`, `/reservations`, etc.) vers les services. Dashboard : http://localhost:8080

### 2. Hotel Service (Port 3001)
Gère les hôtels et les chambres :
- CRUD pour les hôtels
- CRUD pour les chambres
- Recherche par ville
- Gestion de la disponibilité des chambres

### 3. Reservation Service (Port 3002)
Gère les réservations :
- Création de réservations
- Vérification de disponibilité
- Annulation de réservations
- Gestion des dates (check-in/check-out)

### 4. Payment Service (Port 3003)
Gère les paiements :
- Création de paiements
- Traitement des paiements
- Historique des transactions
- Gestion des remboursements

### 5. Notification Service (Port 3004)
Gère les notifications :
- Notifications de réservation
- Notifications de paiement
- Notifications système

## 🛠️ Technologies

- **Framework**: NestJS
- **Language**: TypeScript
- **Base de données**: PostgreSQL
- **Message Broker**: RabbitMQ
- **Containerisation**: Docker & Docker Compose
- **Architecture**: Clean Architecture

## 📁 Structure du projet

```
hotel-booking-system/
├── hotel-service/            # Hotel Service
│   ├── src/
│   │   ├── domain/           # Entities & Interfaces
│   │   ├── application/      # Use Cases
│   │   ├── infrastructure/   # Repositories & External Services
│   │   └── presentation/     # Controllers & DTOs
│   └── Dockerfile
│
├── reservation-service/      # Reservation Service
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── Dockerfile
│
├── payment-service/          # Payment Service
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── Dockerfile
│
├── notification-service/     # Notification Service
│   ├── src/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── Dockerfile
│
├── docker-compose.yml        # Configuration Docker
└── README.md
```

## 🚀 Installation

### Prérequis

- Docker & Docker Compose
- Node.js 18+ (pour le développement local)

### Installation des dépendances

```bash
# Installer les dépendances pour chaque service
cd hotel-service && npm install && cd ..
cd reservation-service && npm install && cd ..
cd payment-service && npm install && cd ..
cd notification-service && npm install && cd ..
```

## 🏃 Démarrage

### Avec Docker Compose (Recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down
```

### Développement local

```bash
# Démarrer Traefik (ou utiliser docker-compose qui l'inclut)
# Terminal 1 - Hotel Service
cd hotel-service && npm run start:dev

# Terminal 3 - Reservation Service
cd reservation-service && npm run start:dev

# Terminal 4 - Payment Service
cd payment-service && npm run start:dev

# Terminal 5 - Notification Service
cd notification-service && npm run start:dev
```

## 📡 API Endpoints

### API via Traefik (http://localhost:3000)

**Page d’accueil** : [http://localhost:3000](http://localhost:3000) — liens vers les endpoints et les Swagger.

**Swagger (pour les devs front)** : chaque service expose sa doc sur `/api` via Traefik :
- **Auth** : http://localhost:3000/auth/api
- **Users** : http://localhost:3000/users/api
- **Hotels** : http://localhost:3000/hotels/api
- **Reservations** : http://localhost:3000/reservations/api
- **Payments** : http://localhost:3000/payments/api
- **Notifications** : http://localhost:3000/notifications/api

Les requêtes « Try it out » dans Swagger partent vers `localhost:3000`, donc tout passe par Traefik (un seul point d’entrée, CORS géré par les services).

**Sécurité :** Swagger n'est exposé **qu'en dev/staging** (`NODE_ENV !== 'production'`). En production, les liens `/auth/api`, `/hotels/api`, etc. renvoient 404 côté service, donc même avec le lien direct vers un microservice, la doc n'est pas accessible.

**Accès API en production (Postman, etc.) :** Oui, les routes API restent accessibles en production (sinon le front ne pourrait pas les appeler). La sécurité ne repose **pas** sur le fait de cacher l’URL :
- **Routes publiques** (ex. `POST /auth/login`, `POST /auth/register`) : tout le monde peut les appeler (Postman, front, mobile). C’est voulu. On les protège par validation, rate limiting, captcha si besoin.
- **Routes protégées** (ex. `GET /hotels`, `POST /reservations`) : **JWT obligatoire**. Sans token valide → **401 Unauthorized**. Connaître le lien ne suffit pas : il faut un token obtenu via login. En production, CORS peut être restreint à l’origine du front pour limiter les appels depuis d’autres domaines (le navigateur bloque ; Postman ou un script peuvent toujours envoyer un JWT valide, d’où l’importance de ne pas exposer de token et de bien gérer les rôles).

#### Hotels
- `GET /hotels` - Liste tous les hôtels
- `GET /hotels?city=Paris` - Recherche par ville
- `GET /hotels/:id` - Détails d'un hôtel
- `POST /hotels` - Créer un hôtel
- `PUT /hotels/:id` - Mettre à jour un hôtel
- `DELETE /hotels/:id` - Supprimer un hôtel
- `GET /hotels/:id/rooms` - Liste des chambres d'un hôtel
- `POST /hotels/:id/rooms` - Créer une chambre
- `PUT /hotels/:id/rooms/:roomId` - Mettre à jour une chambre
- `DELETE /hotels/:id/rooms/:roomId` - Supprimer une chambre

#### Reservations
- `GET /reservations` - Liste toutes les réservations
- `GET /reservations?userId=1` - Réservations d'un utilisateur
- `GET /reservations/:id` - Détails d'une réservation
- `POST /reservations` - Créer une réservation
- `PUT /reservations/:id` - Mettre à jour une réservation
- `DELETE /reservations/:id` - Annuler une réservation

#### Payments
- `GET /payments` - Liste tous les paiements
- `GET /payments?reservationId=1` - Paiements d'une réservation
- `GET /payments/:id` - Détails d'un paiement
- `POST /payments` - Créer un paiement
- `POST /payments/:id/process` - Traiter un paiement

#### Notifications
- `GET /notifications` - Liste toutes les notifications
- `GET /notifications?userId=1` - Notifications d'un utilisateur
- `GET /notifications/:id` - Détails d'une notification
- `POST /notifications` - Créer une notification
- `PATCH /notifications/:id/read` - Marquer comme lu

## 🗄️ Base de données

### Hotel Service (DB_Hotel)

**Table: hotels**
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- city (VARCHAR)
- address (VARCHAR)
- description (TEXT)
- rating (DECIMAL)
- image_url (VARCHAR)
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Table: rooms**
- id (SERIAL PRIMARY KEY)
- hotel_id (INT REFERENCES hotels)
- type (VARCHAR)
- price (DECIMAL)
- available (BOOLEAN)
- capacity (INT)
- description (TEXT)
- image_url (VARCHAR)
- amenities (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Reservation Service (DB_Reservation)

**Table: reservations**
- id (SERIAL PRIMARY KEY)
- user_id (INT)
- hotel_id (INT)
- room_id (INT)
- status (ENUM: pending, confirmed, cancelled, completed)
- total_price (DECIMAL)
- guests (INT)
- special_requests (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Table: reservation_dates**
- id (SERIAL PRIMARY KEY)
- reservation_id (INT REFERENCES reservations)
- check_in (DATE)
- check_out (DATE)
- created_at (TIMESTAMP)

### Payment Service (DB_Payment)

**Table: payments**
- id (SERIAL PRIMARY KEY)
- reservation_id (INT)
- amount (DECIMAL)
- status (ENUM: pending, processing, completed, failed, refunded)
- method (ENUM: credit_card, debit_card, paypal, bank_transfer)
- transaction_id (VARCHAR)
- payment_token (VARCHAR)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Table: payment_transactions**
- id (SERIAL PRIMARY KEY)
- payment_id (INT REFERENCES payments)
- type (ENUM: payment, refund)
- status (ENUM: success, failed)
- amount (DECIMAL)
- external_transaction_id (VARCHAR)
- error_message (TEXT)
- metadata (JSONB)
- created_at (TIMESTAMP)

### Notification Service (DB_Notification)

**Table: notifications**
- id (SERIAL PRIMARY KEY)
- user_id (INT)
- type (ENUM: reservation_created, reservation_confirmed, reservation_cancelled, payment_completed, payment_failed, reminder)
- message (TEXT)
- read (BOOLEAN)
- sent_at (TIMESTAMP)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## 🔔 RabbitMQ Events

### Queues

#### Hotel Service
- `room.availability.check` - Vérifier la disponibilité d'une chambre
- `room.availability.update` - Mettre à jour la disponibilité
- `hotel.created` - Hôtel créé
- `hotel.updated` - Hôtel mis à jour

#### Reservation Service
- `reservation.created` - Réservation créée
- `reservation.confirmed` - Réservation confirmée
- `reservation.cancelled` - Réservation annulée
- `payment.required` - Paiement requis

#### Payment Service
- `payment.completed` - Paiement complété
- `payment.failed` - Paiement échoué

#### Notification Service
- Écoute tous les événements ci-dessus pour créer des notifications

### Flux d'événements

1. **Création de réservation**:
   - Reservation Service → `reservation.created` → Notification Service
   - Reservation Service → `payment.required` → Payment Service

2. **Paiement complété**:
   - Payment Service → `payment.completed` → Reservation Service & Notification Service
   - Reservation Service → `reservation.confirmed` → Notification Service

3. **Annulation**:
   - Reservation Service → `reservation.cancelled` → Notification Service

## 🏗️ Clean Architecture

Chaque service suit les principes de Clean Architecture :

```
src/
├── domain/              # Couche domaine (business logic pure)
│   ├── entities/        # Entités métier
│   └── repositories/    # Interfaces de repositories
│
├── application/         # Couche application (use cases)
│   └── use-cases/       # Cas d'utilisation
│
├── infrastructure/      # Couche infrastructure (implémentations)
│   ├── database/        # Configuration DB
│   ├── repositories/    # Implémentations des repositories
│   └── rabbitmq/        # Service RabbitMQ
│
└── presentation/        # Couche présentation (API)
    ├── controllers/     # Controllers REST
    ├── services/        # Services de présentation
    └── dto/             # Data Transfer Objects
```

## 🔧 Configuration

### Variables d'environnement

Chaque service utilise des variables d'environnement définies dans `docker-compose.yml` :

- `DATABASE_URL` - URL de connexion PostgreSQL
- `RABBITMQ_URL` - URL de connexion RabbitMQ
- `PORT` - Port du service
- `NODE_ENV` - Environnement (development/production)

### Accès aux services

- **Traefik (API)**: http://localhost:3000 — **Dashboard Traefik**: http://localhost:8080
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **PostgreSQL Hotels**: localhost:5432
- **PostgreSQL Reservations**: localhost:5433
- **PostgreSQL Payments**: localhost:5434
- **PostgreSQL Notifications**: localhost:5435

## 📝 Exemples d'utilisation

### Créer un hôtel

```bash
curl -X POST http://localhost:3000/hotels \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grand Hotel Paris",
    "city": "Paris",
    "address": "123 Rue de la Paix",
    "description": "Un magnifique hôtel au cœur de Paris",
    "rating": 4.5
  }'
```

### Créer une réservation

```bash
curl -X POST http://localhost:3000/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "hotel_id": 1,
    "room_id": 1,
    "check_in": "2026-02-01",
    "check_out": "2026-02-05",
    "guests": 2
  }'
```

### Traiter un paiement

```bash
curl -X POST http://localhost:3000/payments/1/process \
  -H "Content-Type: application/json" \
  -d '{
    "payment_token": "tok_1234567890"
  }'
```

## 🧪 Tests

```bash
# Tests unitaires pour chaque service
cd hotel-service && npm test
cd reservation-service && npm test
cd payment-service && npm test
cd notification-service && npm test
```

## 📚 Documentation supplémentaire

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ en utilisant NestJS et Clean Architecture
