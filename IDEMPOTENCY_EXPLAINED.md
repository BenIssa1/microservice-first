# Comment garantir la même clé même avec des clics multiples ?

## 🎯 Le problème

Si l'utilisateur clique 5 fois en 1 milliseconde, comment s'assurer qu'on utilise la **même clé** et pas 5 clés différentes ?

## ✅ La solution : Stockage de la clé AVANT le premier clic

### ❌ Mauvaise approche (génère plusieurs clés)

```typescript
const handleClick = () => {
  const key = uuidv4(); // ❌ Nouvelle clé à CHAQUE appel !
  // Si 5 clics → 5 clés différentes
  fetch('/api/reservations', {
    headers: { 'Idempotency-Key': key }
  });
};
```

### ✅ Bonne approche (une seule clé)

```typescript
// La clé est stockée EN DEHORS de la fonction
let idempotencyKey: string | null = null;
let isSubmitting = false;

const handleClick = () => {
  // Si déjà en cours, ignorer
  if (isSubmitting) {
    return; // ← Sort immédiatement, ne génère pas de nouvelle clé
  }

  // Générer la clé UNE SEULE FOIS
  if (!idempotencyKey) {
    idempotencyKey = uuidv4(); // ← Généré une seule fois
  }

  isSubmitting = true;

  fetch('/api/reservations', {
    headers: { 'Idempotency-Key': idempotencyKey } // ← Même clé pour tous les clics
  });
};
```

## 🔍 Comment ça fonctionne techniquement ?

### 1. JavaScript est mono-thread (Event Loop)

Même si l'utilisateur clique 5 fois rapidement, JavaScript traite les événements **un par un** dans une queue :

```
Clic 1 → [Génère clé: abc-123] → [Démarre requête]
Clic 2 → [Clé existe déjà: abc-123] → [Démarre requête]
Clic 3 → [Clé existe déjà: abc-123] → [Démarre requête]
Clic 4 → [Clé existe déjà: abc-123] → [Démarre requête]
Clic 5 → [Clé existe déjà: abc-123] → [Démarre requête]
```

**Important** : Les événements sont traités **séquentiellement**, pas simultanément !

### 2. Utilisation de `useRef` (React)

`useRef` persiste entre les renders et garantit une seule instance :

```typescript
import { useRef } from 'react';

function ReservationForm() {
  // useRef persiste entre les renders
  const idempotencyKeyRef = useRef<string | null>(null);
  const isSubmittingRef = useRef(false);

  const handleSubmit = () => {
    // Vérification IMMÉDIATE (synchrone)
    if (isSubmittingRef.current) {
      return; // ← Sort avant même de générer une clé
    }

    // Générer la clé UNE SEULE FOIS
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = uuidv4();
      console.log('Clé générée:', idempotencyKeyRef.current);
    }

    // Marquer comme "en cours" IMMÉDIATEMENT
    isSubmittingRef.current = true;

    // Toutes les requêtes suivantes utiliseront la même clé
    fetch('/api/reservations', {
      headers: { 'Idempotency-Key': idempotencyKeyRef.current }
    });
  };
}
```

### 3. Protection avec verrou (Lock Pattern)

Pour être **100% sûr**, on peut utiliser un verrou atomique :

```typescript
class IdempotencyManager {
  private key: string | null = null;
  private lock: boolean = false;

  getKey(): string {
    // Si verrouillé, retourner la clé existante
    if (this.lock) {
      if (!this.key) {
        throw new Error('Lock activé mais pas de clé');
      }
      return this.key;
    }

    // Verrouiller AVANT de générer
    this.lock = true;

    // Générer la clé
    if (!this.key) {
      this.key = uuidv4();
    }

    return this.key;
  }

  reset() {
    this.lock = false;
    this.key = null;
  }
}

// Usage
const manager = new IdempotencyManager();

const handleClick = () => {
  const key = manager.getKey(); // ← Toujours la même clé
  fetch('/api/reservations', {
    headers: { 'Idempotency-Key': key }
  });
};
```

## 📊 Timeline détaillée

### Scénario : 3 clics en 1ms

```
Temps: 0ms
├─ Clic 1 détecté
├─ Vérifie isSubmitting: false
├─ Génère clé: "abc-123"
├─ Met isSubmitting = true
└─ Démarre requête avec clé "abc-123"

Temps: 0.1ms
├─ Clic 2 détecté
├─ Vérifie isSubmitting: true ✅
└─ RETURN (sort immédiatement, pas de nouvelle clé)

Temps: 0.2ms
├─ Clic 3 détecté
├─ Vérifie isSubmitting: true ✅
└─ RETURN (sort immédiatement, pas de nouvelle clé)
```

**Résultat** : 1 seule clé générée, 1 seule requête envoyée

## 🛡️ Protection multi-niveaux

### Niveau 1 : Vérification synchrone (instantanée)

```typescript
if (isSubmitting) {
  return; // ← Bloque en < 1ms
}
```

### Niveau 2 : Désactivation du bouton (HTML)

```tsx
<button disabled={isSubmitting}>
  Réserver
</button>
```

### Niveau 3 : Clé d'idempotence (Backend)

Même si plusieurs requêtes passent, le backend garantit l'idempotence.

## 🧪 Test de preuve

```typescript
let keyCount = 0;
let keyGenerated = '';

const handleClick = () => {
  if (isSubmitting) return;
  
  if (!idempotencyKey) {
    idempotencyKey = uuidv4();
    keyCount++; // Compteur
    keyGenerated = idempotencyKey;
    console.log(`Clé #${keyCount} générée: ${idempotencyKey}`);
  }
  
  isSubmitting = true;
};

// Simuler 100 clics rapides
for (let i = 0; i < 100; i++) {
  handleClick();
}

console.log(`Total clés générées: ${keyCount}`); // → 1
console.log(`Clé utilisée: ${keyGenerated}`); // → Même clé pour tous
```

## ⚡ Performance

- **Vérification du verrou** : < 0.001ms (opération synchrone)
- **Génération UUID** : ~0.01ms
- **Total** : < 0.1ms avant que le 2ème clic ne soit traité

## 🎯 Résumé

1. **Stockage de la clé en dehors de la fonction** (useRef, variable module, classe)
2. **Vérification synchrone** avant génération (if lock return)
3. **Verrou immédiat** après génération (lock = true)
4. **JavaScript est mono-thread** → les événements sont traités séquentiellement

**Résultat** : Même avec 1000 clics en 1ms, **1 seule clé** est générée ! 🎉
