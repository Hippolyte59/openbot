<div align="center">

# OpenBot

**Open-source Discord bot for economy and progression systems — a free, self-hostable alternative to DraftBot.**

[English](#english) | [Français](#français)

![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)

</div>

---

<a id="english"></a>

## English

### Overview

OpenBot provides economy, leveling, shop and mini-game systems through slash commands.
It is designed to be simple to host, easy to customize, and free for everyone.

### Features

- **Economy** — daily rewards with streak bonuses, hourly jobs, betting, player-to-player transfers
- **Leveling** — XP earned by chatting, level-up announcements with coin rewards
- **Shop & inventory** — mystery boxes, lottery tickets, coffee boosts, extensible item catalog
- **Server leaderboards** — top 10 by balance, level or total XP
- **Custom embeds** — configurable color, consistent footer and timestamps
- **Zero database setup** — embedded SQLite storage (single local file)
- **Simple architecture** — adding a command means adding one file

### Commands

| Command | Description |
|---|---|
| `/ping` | Show bot latency |
| `/aide` | List all commands |
| `/profil [member]` | View a member's level, XP, balance and streak |
| `/classement <type>` | Server top 10 (balance / level / XP) |
| `/quotidien` | Claim your daily reward (streak bonus) |
| `/travail` | Earn coins once per hour |
| `/parier <amount>` | Coin flip: double your bet or lose it |
| `/donner <member> <amount>` | Give coins to another member |
| `/boutique` | Browse the shop |
| `/acheter <item> [quantity]` | Purchase an item |
| `/inventaire` | View your items |
| `/utiliser <item>` | Use an item (mystery box, lottery…) |
| `/piece` | Flip a coin |
| `/de [faces]` | Roll a dice |
| `/8ball <question>` | Ask the magic bot a question |

### Requirements

- [Node.js](https://nodejs.org/) 20 or later
- A Discord application (see below)

### Setup

1. Create the application on the [Discord Developer Portal](https://discord.com/developers/applications):
   - **Bot** tab: click *Reset Token* and copy the token; enable the privileged **Message Content Intent**
   - **General Information** tab: copy the **Application ID**
2. Invite the bot to your server:

   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=2147568640&scope=bot%20applications.commands
   ```

3. Install and run:

   ```bash
   git clone https://github.com/Hippolyte59/openbot.git
   cd openbot

   npm install          # or: pnpm install
   cp .env.example .env # fill in DISCORD_TOKEN and CLIENT_ID

   npm run deploy       # register slash commands with Discord
   npm run build && npm start

   # development mode (auto-restart):
   npm run dev
   ```

### Environment variables (.env)

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Bot token (Developer Portal → Bot) |
| `CLIENT_ID` | Recommended | Application ID — auto-detected by `npm run deploy` if omitted |
| `GUILD_ID` | No | Test server ID: deploys commands instantly instead of waiting up to 1 hour |
| `EMBED_COLOR` | No | Embed color in hexadecimal (default: `#5865F2`) |
| `BOT_NAME` | No | Name shown in embed footers (default: `OpenBot`) |

### Customization

- **Add a command**: create a file in `src/commands/`, following the existing examples — it is loaded automatically
- **Add a shop item**: edit `src/data/items.ts`
- **Tune the economy**: cooldowns and XP rates live in `src/config.ts`

### Project structure

```
src/
├── index.ts               # Entry point: client, events, login
├── deploy.ts              # Slash command deployment script
├── config.ts              # Environment variables & settings
├── loaders.ts             # Automatic command loading
├── types.ts               # Shared types (Command interface…)
├── commands/              # One command = one file (auto-loaded)
├── events/                # ready, interactions, message XP
├── database/
│   ├── db.ts              # SQLite connection + schema
│   ├── players.ts         # Balance, XP, levels, leaderboards
│   └── inventory.ts       # Player inventories
├── data/
│   └── items.ts           # Shop catalog
└── utils/                 # Embeds, formatting, randomness
```

### Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Ideas that would fit well: RPG battles, pets, guilds, badges.

### License

Released under the [MIT](LICENSE) license.

---

<a id="français"></a>

## Français

### Aperçu

OpenBot propose des systèmes d'économie, de niveaux, de boutique et de mini-jeux accessibles en commandes slash.
Le bot est pensé pour être simple à héberger, facile à personnaliser et libre pour tous.

### Fonctionnalités

- **Économie** — récompense quotidienne avec bonus de série, travail horaire, paris, dons entre joueurs
- **Niveaux** — XP gagnée en discutant, annonces de montée de niveau avec bonus de pièces
- **Boutique et inventaire** — boîtes mystère, tickets de loterie, cafés, catalogue d'objets extensible
- **Classements du serveur** — top 10 par argent, niveau ou XP totale
- **Embeds personnalisés** — couleur configurable, footer et horodatage cohérents
- **Zéro configuration de base de données** — stockage SQLite embarqué (un fichier local)
- **Architecture simple** — ajouter une commande revient à ajouter un fichier

### Commandes

| Commande | Description |
|---|---|
| `/ping` | Affiche la latence du bot |
| `/aide` | Liste toutes les commandes |
| `/profil [membre]` | Niveau, XP, argent et série d'un membre |
| `/classement <type>` | Top 10 du serveur (argent / niveau / XP) |
| `/quotidien` | Récompense quotidienne (bonus de série) |
| `/travail` | Gagne des pièces une fois par heure |
| `/parier <montant>` | Pile ou face : double la mise ou la perd |
| `/donner <membre> <montant>` | Offre des pièces à un membre |
| `/boutique` | Affiche la boutique |
| `/acheter <objet> [quantité]` | Achète un objet |
| `/inventaire` | Affiche tes objets |
| `/utiliser <objet>` | Utilise un objet (boîte mystère, loterie…) |
| `/piece` | Lance une pièce |
| `/de [faces]` | Lance un dé |
| `/8ball <question>` | Pose une question au bot magique |

### Prérequis

- [Node.js](https://nodejs.org/) 20 ou supérieur
- Une application Discord (voir ci-dessous)

### Mise en place

1. Crée l'application sur le [Discord Developer Portal](https://discord.com/developers/applications) :
   - Onglet **Bot** : clique sur *Reset Token*, copie le token ; active l'intent privilégié **Message Content Intent**
   - Onglet **General Information** : copie l'**Application ID**
2. Invite le bot sur ton serveur :

   ```
   https://discord.com/oauth2/authorize?client_id=TON_APPLICATION_ID&permissions=2147568640&scope=bot%20applications.commands
   ```

3. Installe et lance :

   ```bash
   git clone https://github.com/Hippolyte59/openbot.git
   cd openbot

   npm install          # ou : pnpm install
   cp .env.example .env # remplis DISCORD_TOKEN et CLIENT_ID

   npm run deploy       # enregistre les commandes slash sur Discord
   npm run build && npm start

   # mode développement (redémarrage automatique) :
   npm run dev
   ```

### Variables d'environnement (.env)

| Variable | Obligatoire | Description |
|---|---|---|
| `DISCORD_TOKEN` | Oui | Token du bot (Developer Portal → Bot) |
| `CLIENT_ID` | Recommandé | Application ID — déduit automatiquement par `npm run deploy` si absent |
| `GUILD_ID` | Non | ID d'un serveur de test : déploie les commandes instantanément au lieu d'attendre ~1 h |
| `EMBED_COLOR` | Non | Couleur des embeds en hexadécimal (défaut : `#5865F2`) |
| `BOT_NAME` | Non | Nom affiché dans le pied des embeds (défaut : `OpenBot`) |

### Personnalisation

- **Ajouter une commande** : crée un fichier dans `src/commands/` sur le modèle des existantes — il est chargé automatiquement
- **Ajouter un objet en boutique** : modifie `src/data/items.ts`
- **Ajuster l'économie** : les cooldowns et gains d'XP sont dans `src/config.ts`

### Structure du projet

Voir la section [anglaise](#english) pour l'arborescence détaillée.

### Contribuer

Les contributions sont les bienvenues. Consulte [CONTRIBUTING.md](CONTRIBUTING.md).

Idées bienvenues : combats RPG, animaux de compagnie, guildes, badges.

### Licence

Distribué sous licence [MIT](LICENSE).
