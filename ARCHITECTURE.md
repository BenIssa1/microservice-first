# Architecture Microservices - Bonnes Pratiques

## 📋 Vue d'ensemble

Ce document explique les décisions architecturales et les bonnes pratiques appliquées dans ce projet microservices.

## 🏗️ Architecture Actuelle

### Séparation des Services

#### 1. **User Service** (`user-service`)
- **Responsabilité** : Gestion des données utilisateur (profil)
- **Données** : Nom, prénom, email, téléphone, rôle, date de naissance
- **Base de données** : PostgreSQL (`db_user`)

#### 2. **Auth Service** (`auth-service`)
- **Responsabilité** : Authentification et autorisation
- **Données** : Password hash, refresh tokens, tentatives de connexion
- **Base de données** : PostgreSQL (`db_auth`)

#### 3. **Traefik** (reverse proxy)
- **Responsabilité** : Point d'entrée unique, routage HTTP par préfixe de chemin
- **Fonctions** : Route `/auth` → auth-service, `/hotels` → hotel-service, etc.
- **Authentification** : Chaque service applique ses propres guards JWT

## ✅ Bonnes Pratiques Appliquées

### 1. Séparation des Responsabilités (SoC)

✅ **Pourquoi séparer User et Auth ?**
- **Sécurité** : Les credentials sont isolés dans un service dédié
- **Scalabilité** : Chaque service peut être mis à l'échelle indépendamment
- **Maintenance** : Changements dans l'authentification n'affectent pas les données utilisateur
- **Conformité** : Facilite la conformité RGPD (données sensibles séparées)

### 2. Gestion des Transactions Distribuées

#### Problème
Dans une architecture microservices, il n'y a **pas de transactions ACID distribuées** par défaut. Si la création échoue à mi-parcours, on peut avoir des données incohérentes.

#### Solution : Pattern "Compensating Actions" (Saga Pattern simplifié)

**Flux d'inscription (`POST /auth/register`)** :
```
1. Vérifier si email existe déjà (Auth + User)
2. Hasher le mot de passe (fail fast)
3. Créer l'utilisateur dans User Service
4. Créer les credentials dans Auth Service
   └─ Si échec → Supprimer l'utilisateur créé (compensation)
5. Retourner les informations de l'utilisateur créé
   └─ L'utilisateur doit se connecter via /auth/login pour obtenir les tokens
```

**Flux de création admin (`POST /users` avec password)** :
```
1. Créer l'utilisateur dans User Service
2. Créer les credentials dans Auth Service
   └─ Si échec → Supprimer l'utilisateur créé (compensation)
```

#### Avantages
- ✅ Évite les utilisateurs orphelins (sans credentials)
- ✅ Gestion d'erreur cohérente
- ✅ Pas besoin de système de transactions distribué complexe

#### Limitations
- ⚠️ La compensation peut échouer (meilleur effort)
- ⚠️ Pas de garantie ACID complète (acceptable en microservices)

### 3. Orchestration vs Choreography

**Approche actuelle : Orchestration**

- **Auth Service orchestre** l'inscription (`RegisterUseCase`)
- **User Service** (ou un orchestrateur) gère la création admin avec credentials

**Pourquoi cette approche ?**
- ✅ Plus simple à comprendre et déboguer
- ✅ Logique centralisée dans un seul endroit
- ✅ Facile à ajouter des validations supplémentaires

**Alternative : Choreography (Events)**
- Utiliser RabbitMQ pour des événements (`user.created`, `auth.created`)
- Plus découplé mais plus complexe
- Recommandé pour des systèmes très distribués

### 4. Validation et Vérifications

**Double vérification avant création** :
```typescript
// Vérifier Auth ET User pour éviter les incohérences
const existingAuth = await authRepository.findByEmail(email);
const existingUser = await userServiceClient.getUserByEmail(email);
```

**Pourquoi ?**
- Un utilisateur peut exister sans credentials (créé par admin)
- Un email peut être réservé dans Auth mais pas encore créé dans User
- Évite les conflits et les erreurs de duplication

## 🔄 Flux de Données

### Inscription Publique (`POST /auth/register`)

```
Client
  ↓
Traefik (port 3000) → /auth/register
  ↓
Auth Service (RegisterUseCase)
  ├─→ Vérifie email dans Auth
  ├─→ Vérifie email dans User
  ├─→ Hash password
  ├─→ User Service (createUser)
  │     └─→ Crée User dans db_user
  ├─→ Auth Repository (create)
  │     └─→ Crée Auth dans db_auth
  │     └─→ Si échec → Supprime User (compensation)
  └─→ Retourne { user, message }
  ↓
Retourne { user, message: "User registered successfully. Please login..." }
```

**Note** : L'inscription ne génère **pas** de tokens. L'utilisateur doit se connecter via `POST /auth/login` pour obtenir les tokens JWT.

### Création Admin (`POST /users` avec password)

```
Admin (authentifié)
  ↓
Traefik → /users
  ↓
User Service
  ├─→ User Service (createUser)
  │     └─→ Crée User dans db_user
  └─→ Auth Service (create-credentials)
        └─→ Crée Auth dans db_auth
        └─→ Si échec → Supprime User (compensation)
  ↓
Retourne User
```

### Connexion (`POST /auth/login`)

```
Client
  ↓
Traefik → /auth/login
  ↓
Auth Service (LoginUseCase)
  ├─→ Auth Repository (findByEmail)
  ├─→ Vérifie password (bcrypt.compare)
  ├─→ User Service (getUserById)
  └─→ Génère tokens JWT
  ↓
Retourne { user, access_token, refresh_token }
```

## 🎯 Recommandations Futures

### 1. Pattern Saga (pour transactions complexes)
Pour des workflows plus complexes (ex: réservation → paiement → notification), considérer :
- **Saga Orchestrator** : Service dédié qui orchestre les étapes
- **Saga Choreography** : Services communiquent via événements

### 2. Idempotence
Ajouter des clés idempotentes pour éviter les créations en double :
```typescript
POST /auth/register
Headers: { "Idempotency-Key": "uuid" }
```

### 3. Event Sourcing (optionnel)
Pour un audit complet et la récupération d'état :
- Stocker tous les événements (user.created, auth.created)
- Reconstruire l'état depuis les événements

### 4. Circuit Breaker
Pour la résilience face aux pannes :
```typescript
// Si User Service est down, éviter de créer Auth
if (userServiceUnavailable) {
  throw ServiceUnavailableException();
}
```

## 📊 Comparaison des Approches

| Aspect | Orchestration (actuel) | Choreography (Events) |
|--------|----------------------|----------------------|
| Complexité | ⭐⭐ Faible | ⭐⭐⭐⭐ Élevée |
| Découplage | ⭐⭐⭐ Moyen | ⭐⭐⭐⭐⭐ Très élevé |
| Débogage | ⭐⭐⭐⭐⭐ Facile | ⭐⭐ Difficile |
| Scalabilité | ⭐⭐⭐⭐ Bonne | ⭐⭐⭐⭐⭐ Excellente |
| Cohérence | ⭐⭐⭐⭐ Bonne | ⭐⭐⭐ Moyenne |

**Conclusion** : Pour ce projet, l'orchestration est le bon choix car :
- Système de taille moyenne
- Besoin de cohérence forte
- Facilité de maintenance importante

## 🔐 Sécurité

### Bonnes Pratiques Appliquées

1. **Séparation des credentials** : Password hash dans Auth Service uniquement
2. **Hash sécurisé** : bcrypt avec 10 rounds de salt
3. **JWT avec expiration** : Access token (court) + Refresh token (long)
4. **Validation d'email** : Vérification avant création
5. **Rate limiting** : À implémenter sur `/auth/login`

### À Améliorer

- [ ] Rate limiting sur les endpoints d'authentification
- [ ] Lockout après X tentatives échouées (déjà partiellement implémenté)
- [ ] Validation d'email (envoi de confirmation)
- [ ] 2FA (Two-Factor Authentication)

## 📝 Conclusion

L'architecture actuelle suit les **bonnes pratiques microservices** :

✅ Séparation claire des responsabilités  
✅ Gestion des transactions distribuées (compensation)  
✅ Validation robuste  
✅ Gestion d'erreur cohérente  
✅ Sécurité des credentials  

Cette architecture est **adaptée pour un système de production** de taille moyenne et peut évoluer vers des patterns plus avancés (Saga, Event Sourcing) si nécessaire.
