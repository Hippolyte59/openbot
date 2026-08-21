<div align="center">

# 🤖 OpenBot

**Un bot Discord open source d'économie et de progression — une alternative libre à DraftBot.**

Héberge-le toi-même, personnalise tout, contribue librement.

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![Node](https://img.shields.io/badge/node-%E2%89%A520-brightgreen?logo=node.js&logoColor=white)

</div>

---

## ✨ Fonctionnalités

- 💰 **Économie complète** : récompense quotidienne avec bonus de série, travail, paris, dons entre joueurs
- ⭐ **Système de niveaux** : XP gagnée en discutant, montées de niveau annoncées avec bonus de pièces
- 🛒 **Boutique & inventaire** : boîtes mystère, tickets de loterie, cafés…
- 🏆 **Classements du serveur** : top 10 par argent, niveau ou XP
- 🎨 **Embeds personnalisés** : couleur configurable, footer et horodatage automatiques
- 🗄️ **Zéro configuration de base de données** : SQLite embarqué (fichier local)
- 🧩 **Architecture simple** : ajouter une commande = ajouter un fichier dans `src/commands/`

## 📋 Commandes

| Commande | Description |
|---|---|
| `/ping` | 🏓 Affiche la latence du bot |
| `/aide` | 📖 Liste toutes les commandes |
| `/profil [membre]` | 👤 Niveau, XP, argent et série d'un membre |
| `/classement <type>` | 🏆 Top 10 du serveur (argent / niveau / XP) |
| `/quotidien` | 🎁 Récompense quotidienne (+ bonus de série) |
| `/travail` | 💼 Un salaire toutes les heures |
| `/parier <montant>` | 🎲 Pile ou face : double la mise ou perd tout |
| `/donner <membre> <montant>` | 🎁 Offre des pièces à un membre |
| `/boutique` | 🛒 Affiche les objets en vente |
| `/acheter <objet> [quantité]` | 🛍️ Achète un objet |
| `/inventaire` | 🎒 Affiche tes objets |
| `/utiliser <objet>` | ✨ Consomme un objet (boîte mystère, loterie…) |
| `/piece` | 🪙 Lance une pièce pour le fun |
| `/de [faces]` | 🎲 Lance un dé à X faces |
| `/8ball <question>` | 🎱 Pose une question au bot magique |

## 🚀 Installation

### 1. Prérequis

- [Node.js](https://nodejs.org/) **20 ou supérieur**
- Un compte Discord + un serveur où tu as les droits d'administration

### 2. Créer le bot sur Discord

1. Va sur le [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. Onglet **Bot** :
   - Clique sur **Reset Token** et copie le token
   - Active l'intent privilégié **Message Content Intent** (nécessaire pour l'XP de discussion)
3. Onglet **General Information** : copie l'**Application ID**

### 3. Inviter le bot sur ton serveur

Remplace `TON_APPLICATION_ID` dans ce lien puis ouvre-le :

```
https://discord.com/oauth2/authorize?client_id=TON_APPLICATION_ID&permissions=2147568640&scope=bot%20applications.commands
```

### 4. Lancer le projet

```bash
# 1. Cloner le dépôt
git clone https://github.com/Hippolyte59/openbot.git
cd openbot

# 2. Installer les dépendances
npm install        # ou : pnpm install

# 3. Configurer les variables d'environnement
cp .env.example .env   # puis remplis DISCORD_TOKEN et CLIENT_ID

# 4. Déployer les commandes slash sur Discord
npm run deploy

# 5a. Démarrer en production
npm run build && npm start

# 5b. …ou démarrer en développement (redémarrage auto)
npm run dev
```

## ⚙️ Configuration (.env)

| Variable | Obligatoire | Description |
|---|---|---|
| `DISCORD_TOKEN` | ✅ | Token du bot (Developer Portal → Bot) |
| `CLIENT_ID` | ⚠️ | Application ID — optionnel : déduit automatiquement par `npm run deploy` |
| `GUILD_ID` | ❌ | ID d'un serveur de test : y déploie les commandes instantanément au lieu d'attendre ~1 h |
| `EMBED_COLOR` | ❌ | Couleur des embeds en hexadécimal (défaut : `#5865F2`) |
| `BOT_NAME` | ❌ | Nom affiché dans le pied des embeds (défaut : `OpenBot`) |

## 🔧 Personnalisation

Tout est pensé pour être modifié facilement :

- **Ajouter une commande** : crée `src/commands/ma-commande.ts` sur le modèle des autres, elle est chargée automatiquement.
- **Ajouter un objet en boutique** : édite `src/data/items.ts`, il apparaît partout (boutique, achat, inventaire, utilisation).
- **Ajuster l'économie** : cooldowns et gains XP dans `src/config.ts`.
- **Changer la couleur des embeds** : variable `EMBED_COLOR`.

## 📂 Structure du projet

```
src/
├── index.ts               # Point d'entrée : client, événements, connexion
├── deploy.ts              # Déploiement des commandes slash
├── config.ts              # Variables d'environnement & réglages
├── loaders.ts             # Chargement automatique des commandes
├── types.ts               # Types partagés (interface Command…)
├── commands/              # Une commande = un fichier (chargement auto)
├── events/                # ready, interactions, XP par message
├── database/
│   ├── db.ts              # Connexion SQLite + schéma
│   ├── players.ts         # Argent, XP, niveaux, classements
│   └── inventory.ts       # Inventaires
├── data/
│   └── items.ts           # Catalogue de la boutique
└── utils/                 # Embeds, formatage, aléatoire
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! Idées acceptées avec plaisir :

- 🗡️ Combats RPG contre des monstres
- 🐾 Animaux de compagnie
- 🏰 Guildes
- 🏅 Badges et récompenses

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) pour démarrer.

## 📄 Licence

Distribué sous licence [MIT](LICENSE) — utilise-le, modifie-le, partage-le. 🎉
