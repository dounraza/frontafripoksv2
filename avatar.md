# Système d'Avatar AFRIPOKS

## Objectif
L'objectif du système d'avatar est de fournir une identité visuelle unique et dynamique à chaque joueur sur la plateforme AFRIPOKS. 

### Fonctionnalités clés :
1. **Génération Dynamique** : Utilisation de l'API DiceBear pour générer des avatars basés sur le pseudo du joueur (seed).
2. **Cohérence Visuelle** : L'avatar doit être identique dans le Lobby, sur la Table de Poker et dans le Profil Utilisateur.
3. **Indicateurs d'État** :
   - **Bordure Jaune** : Utilisateur standard.
   - **Animation Pulse** : Indique que l'utilisateur est connecté et actif.
   - **Effet de Glow** : Utilisé pour mettre en évidence le joueur dont c'est le tour.

### Spécifications Techniques :
- **Source** : `https://api.dicebear.com/9.x/adventurer/svg?seed={username}`
- **Format** : SVG dynamique.
- **Conteneurs** : Cercles avec bordures de 2px à 4px selon le contexte (Table vs Profil).

---

## ORDRE POUR LE BACKEND (Correction Connexion)

Le backend bloque actuellement les requêtes du frontend à cause de la politique CORS. Voici l'ordre de modification à appliquer sur le serveur Railway :

**Problème détecté :** Le serveur renvoie `Access-Control-Allow-Origin: https://railway.com`, ce qui interdit l'accès depuis `localhost`.

**Action requise :** Modifier la configuration CORS dans le fichier principal du backend (ex: `server.js` ou `index.js`) :

1. **Pour Express :**
```javascript
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "https://backafripoksv2.railway.app"],
  credentials: true
}));
```

2. **Pour Socket.io :**
```javascript
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://backafripoksv2.railway.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});
```
