# Guide d'Authentification et d'Autorisation

## 🎯 Bonnes Pratiques : Où placer la protection des routes ?

### ✅ **Réponse : Sur chaque service (avec Traefik en reverse proxy)**

**Avec Traefik**, il n’y a plus d’API Gateway applicatif. Le routage est assuré par Traefik (reverse proxy), et **chaque service applique lui-même** la validation JWT et le contrôle des rôles.

**Pourquoi sur les services ?**

1. **Point d’entrée unique** : Traefik route par chemin (`/auth`, `/hotels`, etc.) vers le bon service
2. **Sécurité au plus près du métier** : Chaque service valide le JWT et les rôles pour ses propres routes
3. **Pas de couche applicative centralisée** : Moins de code à maintenir qu’un gateway dédié
4. **Cohérence** : Même `JWT_SECRET` partagé entre les services pour valider les tokens

### ❌ **Pourquoi plus d’API Gateway dédié ?**

- Traefik assure le routage et le point d’entrée unique
- Les services ont déjà leurs guards JWT et rôles (NestJS)
- Moins de duplication qu’un gateway qui proxyait tout

## 🏗️ Architecture Implémentée

```
Client
  ↓
Traefik (reverse proxy, port 3000)
  ↓
Services (chacun valide JWT + rôles sur ses routes)
```

## 🔐 Système d'Authentification

### Guards par service

Chaque service (hotel-service, reservation-service, etc.) applique dans son `app.module.ts` :
- `JwtAuthGuard` : Valide le token JWT
- `RolesGuard` : Vérifie les rôles utilisateur

### Décorateurs Disponibles

#### `@Public()`
Marque une route comme publique (pas d'authentification requise)

```typescript
@Public()
@Get('hotels')
findAll() {
  // Accessible sans authentification
}
```

#### `@Roles('user', 'admin')`
Spécifie les rôles autorisés pour accéder à la route

```typescript
@Roles('admin')
@Post('hotels')
create() {
  // Seuls les admins peuvent créer des hôtels
}
```

#### `@CurrentUser()`
Injecte les informations de l'utilisateur authentifié

```typescript
@Get('profile')
getProfile(@CurrentUser() user: any) {
  // user = { userId: 1, email: '...', role: 'user' }
}
```

## 📋 Exemples d'Utilisation

### Routes Publiques (Pas d'authentification)

```typescript
@Public()
@Get('hotels')
findAll() {
  // Accessible à tous
}
```

### Routes Authentifiées (User ou Admin)

```typescript
@Roles('user', 'admin')
@Get('reservations')
findAll(@CurrentUser() user: any) {
  // Accessible aux utilisateurs connectés
}
```

### Routes Admin Seulement

```typescript
@Roles('admin')
@Post('hotels')
create(@Body() dto: CreateHotelDto) {
  // Seuls les admins peuvent créer
}
```

### Vérification Manuelle des Permissions

```typescript
@Roles('user', 'admin')
@Get('users/:id')
findOne(@Param('id') id: string, @CurrentUser() user: any) {
  // Users peuvent voir leur propre profil, admins peuvent voir tous
  if (user.role !== 'admin' && user.userId !== +id) {
    throw new ForbiddenException('You can only access your own profile');
  }
  return this.userService.findOne(+id);
}
```

## 🔑 Flux d'Authentification

1. **Registration/Login** → Auth Service génère les tokens JWT
2. **Requête Authentifiée** → Client envoie `Authorization: Bearer <token>`
3. **Traefik** → Route la requête vers le bon service (ex. `/hotels` → hotel-service)
4. **Service cible** → Valide le token avec JwtStrategy et RolesGuard
5. **Route Exécutée** → Si tout est OK

## 📝 Configuration

### Variables d'Environnement (docker-compose.yml)

```yaml
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
```

### Structure du Token JWT

```json
{
  "sub": 1,           // User ID
  "email": "user@example.com",
  "role": "user",    // ou "admin"
  "iat": 1234567890,
  "exp": 1234568790
}
```

## 🛡️ Protection des Routes - Résumé

| Route Type | Décorateur | Exemple |
|------------|-----------|---------|
| Publique | `@Public()` | Liste des hôtels |
| Authentifiée | `@Roles('user', 'admin')` | Mes réservations |
| Admin seulement | `@Roles('admin')` | Créer un hôtel |

## ✅ Avantages de cette Approche

1. ✅ **Sécurité centralisée** : Un seul point de contrôle
2. ✅ **Performance** : Validation rapide au niveau gateway
3. ✅ **Maintenabilité** : Code d'authentification en un seul endroit
4. ✅ **Flexibilité** : Facile d'ajouter de nouveaux rôles
5. ✅ **Services légers** : Les services backend se concentrent sur la logique métier

## 🚀 Prochaines Étapes

Pour utiliser l'authentification :

1. **S'inscrire** : `POST /auth/register`
2. **Se connecter** : `POST /auth/login` → Récupérer le `access_token`
3. **Utiliser le token** : Ajouter `Authorization: Bearer <token>` dans les headers
4. **Accéder aux routes protégées** : Les routes marquées avec `@Roles()` nécessitent le bon rôle
