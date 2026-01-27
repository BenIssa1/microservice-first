# Guide d'Authentification et d'Autorisation

## 🎯 Bonnes Pratiques : Où placer la protection des routes ?

### ✅ **Réponse : Sur l'API Gateway**

**Pourquoi ?**

1. **Point d'entrée unique** : Toutes les requêtes passent par l'API Gateway
2. **Sécurité centralisée** : Une seule couche de sécurité à maintenir
3. **Performance** : Les requêtes non autorisées sont bloquées avant d'atteindre les services
4. **Simplicité** : Les services backend n'ont pas besoin de gérer l'authentification
5. **Séparation des responsabilités** : L'API Gateway gère la sécurité, les services gèrent la logique métier

### ❌ **Pourquoi PAS sur les services individuels ?**

- Duplication de code
- Maintenance complexe
- Risque d'incohérence
- Performance dégradée (validation multiple)

## 🏗️ Architecture Implémentée

```
Client
  ↓
API Gateway (JWT Validation + Role Check)
  ↓
Services Backend (Pas de validation nécessaire)
```

## 🔐 Système d'Authentification

### Guards Globaux

Les guards sont appliqués **globalement** dans `app.module.ts` :
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
3. **API Gateway** → Valide le token avec JwtStrategy
4. **RolesGuard** → Vérifie si l'utilisateur a le bon rôle
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
