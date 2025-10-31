# 🔧 Diagnostic et Résolution des Problèmes de Connexion API

## ❌ Erreur : "Connection timeout"

Cette erreur signifie que votre application mobile ne peut pas atteindre le backend.

---

## 🔍 Étapes de Diagnostic

### 1. Vérifier que le backend tourne

```bash
# Dans le dossier fleetpro-backend/docker
docker compose ps
```

Vous devriez voir le conteneur `fleetpro_api` avec le statut "Up".

Si ce n'est pas le cas :
```bash
cd fleetpro-backend/docker
docker compose up -d
```

---

### 2. Tester l'API depuis votre ordinateur

Ouvrez votre navigateur et allez sur :
- **Swagger UI** : `http://localhost:8000/api/docs/`
- **API Health** : `http://localhost:8000/api/`

Si ces URLs ne fonctionnent pas, le backend n'est pas démarré correctement.

---

### 3. Vérifier votre IP locale actuelle

**Windows (PowerShell)** :
```powershell
ipconfig | Select-String "IPv4"
```

**Windows (CMD)** :
```cmd
ipconfig | findstr IPv4
```

Notez l'IP de votre adaptateur WiFi (généralement commence par `192.168.x.x` ou `10.x.x.x`).

---

### 4. Vérifier que le mobile et le PC sont sur le même réseau WiFi

- 📱 Votre téléphone doit être connecté au **même WiFi** que votre ordinateur
- ❌ Ne pas utiliser le partage de connexion mobile sur le téléphone

---

### 5. Tester la connectivité depuis le mobile

Sur votre téléphone, ouvrez un navigateur et essayez :
```
http://VOTRE_IP:8000/api/docs/
```

Exemple : `http://192.168.1.100:8000/api/docs/`

Si ça ne charge pas :
- ✅ Vérifiez le firewall Windows (voir ci-dessous)
- ✅ Vérifiez que Docker expose bien le port 8000

---

## 🛠️ Solutions

### Solution 1 : Mettre à jour l'IP dans le code

1. Trouvez votre IP actuelle (étape 3 ci-dessus)
2. Modifiez `fleetpro-mobile/src/services/api.ts` ligne 32 :
   ```typescript
   const mobileUrl = 'http://VOTRE_IP:8000/api';
   ```
   Exemple : `'http://192.168.1.100:8000/api'`

3. Redémarrez Expo :
   ```bash
   # Arrêtez Expo (Ctrl+C)
   # Puis relancez
   npm start
   ```

---

### Solution 2 : Utiliser une variable d'environnement (Recommandé)

1. Créez un fichier `.env` dans `fleetpro-mobile/` :
   ```
   EXPO_PUBLIC_API_URL=http://VOTRE_IP:8000/api
   ```
   Exemple : `EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api`

2. Redémarrez Expo :
   ```bash
   npm start
   ```

---

### Solution 3 : Vérifier le Firewall Windows

Le firewall Windows peut bloquer les connexions entrantes.

**Autoriser le port 8000** :

1. Ouvrez **Windows Defender Firewall**
2. Cliquez sur **Paramètres avancés**
3. **Règles de trafic entrant** → **Nouvelle règle...**
4. Choisissez **Port** → **TCP** → Port spécifique : **8000**
5. Autoriser la connexion
6. Appliquez à tous les profils
7. Nommez la règle : "FleetPro API"

**OU** plus simple, autoriser Docker :
1. Firewall → Autoriser une application
2. Cherchez **Docker Desktop** et cochez **Privé** et **Public**

---

### Solution 4 : Vérifier que Docker expose bien le port

Vérifiez dans `fleetpro-backend/docker/docker-compose.yml` :
```yaml
api:
  ports:
    - "8000:8000"  # Doit être présent
```

Si c'est `"127.0.0.1:8000:8000"` au lieu de `"8000:8000"`, changez-le en :
```yaml
    ports:
      - "0.0.0.0:8000:8000"  # Écoute sur toutes les interfaces
```

Puis redémarrez :
```bash
docker compose down
docker compose up -d
```

---

### Solution 5 : Utiliser un tunnel (si IP change souvent)

**Option A : ngrok**
```bash
# Installez ngrok
# Puis :
ngrok http 8000
# Utilisez l'URL HTTPS fournie (ex: https://abc123.ngrok.io)
```

Dans `.env` :
```
EXPO_PUBLIC_API_URL=https://abc123.ngrok.io/api
```

**Option B : Expo Tunnel**
```bash
npm start -- --tunnel
```

---

## ✅ Test Rapide

Après configuration, testez depuis votre téléphone :

```bash
# Depuis PowerShell ou CMD sur votre PC
curl http://VOTRE_IP:8000/api/docs/
```

Si ça fonctionne, l'application mobile devrait aussi fonctionner.

---

## 🐛 Logs de Debug

Vérifiez la console Expo pour voir l'URL utilisée :
```
[API] Platform: android, using default: http://10.6.3.13:8000/api
```

Si l'IP est incorrecte, mettez à jour le code ou la variable d'environnement.

---

## 📝 Checklist Rapide

- [ ] Backend démarré (`docker compose ps`)
- [ ] API accessible depuis PC (`http://localhost:8000/api/docs/`)
- [ ] IP locale identifiée (`ipconfig`)
- [ ] Mobile et PC sur même WiFi
- [ ] IP configurée dans code ou `.env`
- [ ] Firewall autorise le port 8000
- [ ] Docker expose le port correctement
- [ ] Expo redémarré après changement

---

## 🔗 URLs de Test

Remplacez `VOTRE_IP` par votre IP locale :

- **Swagger** : `http://VOTRE_IP:8000/api/docs/`
- **Login** : `http://VOTRE_IP:8000/api/users/login/`
- **Health Check** : `http://VOTRE_IP:8000/api/`

Si ces URLs fonctionnent dans le navigateur du téléphone, l'app devrait aussi fonctionner.

