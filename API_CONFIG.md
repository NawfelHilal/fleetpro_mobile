# Configuration de l'API pour Mobile

## Problème courant : Erreur de connexion depuis le téléphone

Quand vous testez sur un téléphone physique, `host.docker.internal` ne fonctionne pas. Il faut utiliser l'adresse IP locale de votre ordinateur.

## Solution : Configurer l'URL de l'API

### Étape 1 : Trouver votre adresse IP locale

**Sur Windows (PowerShell) :**
```powershell
ipconfig | findstr IPv4
```

Cherchez l'adresse de votre carte réseau active (généralement 192.168.x.x ou 10.x.x.x)

**Sur Mac/Linux :**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Étape 2 : Créer un fichier `.env` dans `fleetpro-mobile/`

Créez un fichier `.env` avec :

```env
EXPO_PUBLIC_API_URL=http://VOTRE_IP:8000/api
```

Par exemple, si votre IP est `192.168.1.100` :
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

### Étape 3 : Vérifier que le backend est accessible

Assurez-vous que :
1. Le backend Django est en cours d'exécution sur le port 8000
2. Le firewall Windows autorise les connexions sur le port 8000
3. Votre téléphone et votre ordinateur sont sur le même réseau WiFi

### Étape 4 : Redémarrer l'app Expo

Après avoir créé/modifié le `.env`, redémarrez Expo :
```bash
npm run start
# ou
docker compose restart app  # si vous utilisez Docker
```

## Vérification

L'écran d'inscription affichera maintenant l'URL utilisée dans les messages d'erreur si la connexion échoue.

## Alternative : Utiliser ngrok ou un tunnel

Si vous ne pouvez pas utiliser votre IP locale, vous pouvez utiliser un service de tunnel comme ngrok.

