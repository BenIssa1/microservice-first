# Guide d'Idempotence pour les Réservations

## 🎯 Problème résolu

L'idempotence empêche la création de réservations en double lorsque :
- L'utilisateur clique plusieurs fois rapidement sur le bouton "Réserver"
- Il y a des problèmes de réseau (timeout, retry automatique)
- Le navigateur envoie plusieurs requêtes simultanées

## 🔑 Comment ça fonctionne

### Principe

1. **Le frontend génère une clé unique** (UUID) **au moment du premier clic**
2. Cette clé est **réutilisée** pour toutes les requêtes suivantes (même si l'utilisateur clique plusieurs fois)
3. Le backend **vérifie si la clé existe déjà** :
   - ✅ Si la clé existe → retourne la réservation existante (pas de doublon)
   - ❌ Si la clé n'existe pas → crée une nouvelle réservation et stocke la clé

### Stratégie Frontend

Le frontend doit combiner **3 techniques** :

1. **Désactivation du bouton** (UX immédiate)
2. **Clé d'idempotence** (protection backend)
3. **État de chargement** (feedback utilisateur)

## 💻 Implémentation Frontend

### Exemple React/TypeScript

```typescript
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function ReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si déjà soumis, ne rien faire
    if (isSubmitted || isLoading) {
      return;
    }

    // Générer la clé UNE SEULE FOIS au premier clic
    const key = idempotencyKey || uuidv4();
    if (!idempotencyKey) {
      setIdempotencyKey(key);
    }

    setIsLoading(true);
    setIsSubmitted(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': key, // ← Clé d'idempotence dans le header
        },
        body: JSON.stringify({
          hotel_id: 1,
          room_id: 1,
          check_in: '2026-02-01',
          check_out: '2026-02-05',
        }),
      });

      if (response.ok) {
        const reservation = await response.json();
        // Afficher le succès
        console.log('Réservation créée:', reservation);
      }
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur réseau, permettre un nouveau essai
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Vos champs de formulaire */}
      
      <button 
        type="submit" 
        disabled={isLoading || isSubmitted}
      >
        {isLoading ? 'Réservation en cours...' : 'Réserver'}
      </button>
    </form>
  );
}
```

### Exemple avec gestion d'état plus robuste

```typescript
import { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

function ReservationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestInProgressRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Empêcher les clics multiples
    if (requestInProgressRef.current) {
      console.log('Requête déjà en cours, ignorée');
      return;
    }

    // Générer la clé UNE SEULE FOIS
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = uuidv4();
      console.log('Nouvelle clé d\'idempotence:', idempotencyKeyRef.current);
    }

    requestInProgressRef.current = true;
    setIsLoading(true);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          hotel_id: 1,
          room_id: 1,
          check_in: '2026-02-01',
          check_out: '2026-02-05',
        }),
      });

      const reservation = await response.json();
      
      // Succès - la clé est maintenant liée à cette réservation
      console.log('Réservation créée:', reservation);
      
    } catch (error) {
      console.error('Erreur:', error);
      // En cas d'erreur, réinitialiser pour permettre un nouvel essai
      idempotencyKeyRef.current = null;
    } finally {
      setIsLoading(false);
      requestInProgressRef.current = false;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? 'Réservation en cours...' : 'Réserver'}
      </button>
    </form>
  );
}
```

### Exemple avec Axios

```typescript
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Intercepteur pour ajouter automatiquement la clé d'idempotence
const idempotencyKeyRef = { current: null as string | null };

axios.interceptors.request.use((config) => {
  // Pour les requêtes POST de réservation
  if (config.method === 'post' && config.url?.includes('/reservations')) {
    // Générer la clé si elle n'existe pas
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = uuidv4();
    }
    config.headers['Idempotency-Key'] = idempotencyKeyRef.current;
  }
  return config;
});

// Après une réservation réussie, réinitialiser pour la prochaine
axios.interceptors.response.use(
  (response) => {
    if (response.config.url?.includes('/reservations') && response.config.method === 'post') {
      idempotencyKeyRef.current = null; // Réinitialiser pour la prochaine réservation
    }
    return response;
  },
  (error) => {
    // En cas d'erreur, réinitialiser aussi
    if (error.config?.url?.includes('/reservations')) {
      idempotencyKeyRef.current = null;
    }
    return Promise.reject(error);
  }
);
```

## 📋 Checklist Frontend

- [ ] **Générer la clé UUID au premier clic** (pas avant)
- [ ] **Désactiver le bouton** pendant le chargement
- [ ] **Réutiliser la même clé** pour les requêtes suivantes
- [ ] **Envoyer la clé dans le header** `Idempotency-Key`
- [ ] **Gérer les erreurs réseau** (réinitialiser la clé si nécessaire)
- [ ] **Afficher un feedback** à l'utilisateur (loading state)

## 🔄 Flux complet

```
1. Utilisateur clique sur "Réserver"
   ↓
2. Frontend génère UUID: "abc-123-def-456"
   ↓
3. Frontend désactive le bouton
   ↓
4. Frontend envoie requête avec header: Idempotency-Key: abc-123-def-456
   ↓
5. Backend vérifie si la clé existe
   ├─ ❌ N'existe pas → Crée réservation + Stocke clé
   └─ ✅ Existe déjà → Retourne réservation existante
   ↓
6. Frontend reçoit la réponse (nouvelle ou existante)
   ↓
7. Frontend affiche le résultat
```

## ⚠️ Cas particuliers

### Erreur réseau

Si la requête échoue (timeout, erreur réseau), le frontend peut :
- **Option 1** : Réutiliser la même clé (le backend retournera la réservation si elle a été créée)
- **Option 2** : Générer une nouvelle clé (si vous voulez permettre un nouvel essai)

### Nouvelle réservation

Pour une **nouvelle réservation** (différent hôtel/chambre/dates), générer une **nouvelle clé**.

## 🧪 Test

Pour tester l'idempotence :

1. Ouvrez la console du navigateur
2. Cliquez rapidement 5 fois sur "Réserver"
3. Vérifiez dans les logs réseau :
   - ✅ Toutes les requêtes ont la **même** `Idempotency-Key`
   - ✅ Le backend retourne la **même** réservation (même ID)
   - ✅ Une seule réservation est créée en base de données

## 📚 Ressources

- **UUID Generator** : `npm install uuid` + `@types/uuid`
- **Documentation** : [RFC 7231 - Idempotent Methods](https://tools.ietf.org/html/rfc7231#section-4.2.2)
