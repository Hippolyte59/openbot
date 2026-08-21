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

### About the project

**What is OpenBot?**

OpenBot is an open-source Discord bot written in TypeScript with [discord.js](https://discord.js.org) v14. It brings classic progression features to any Discord server — economy, experience levels, a shop and mini-games — through native slash commands and clean, customizable embeds.

**What does it include?**

The bot ships with twenty-eight commands built around six systems:

- an **economy**: daily rewards with streak bonuses, hourly jobs, betting, transfers between players;
- a **leveling system**: XP earned while chatting, level-up announcements with coin rewards, per-server leaderboards;
- a **shop and inventory**: consumables, weapons and armor, with an extensible item catalog;
- an **adventure mode**: turn-based monster battles played with buttons — attack, drink a potion or flee — with HP, passive regeneration, equipment bonuses and loot drops;
- a **social life**: adoptable pets that boost your earnings, marriage proposals with accept/refuse buttons, reaction polls;
- **moderation tools**: kick, ban, timeout, message cleanup, slowmode and a warning system.

Everything is stored in an embedded SQLite database — no external database server required — which makes a full installation as simple as cloning the repository and running `npm install`.

**Why does it exist?**

Popular progression bots such as DraftBot are widely used, but they remain closed-source and hosted by someone else. OpenBot was created as a free and transparent alternative that anyone can:

- **self-host** — your community's data stays on your own machine;
- **customize freely** — every cooldown, item and command lives in a readable file; adding one means adding one file;
- **learn from** — the codebase is intentionally small and structured, making it a solid starting point to discover discord.js and TypeScript;
- **contribute to** — features evolve with the community, with no premium tiers and no locked commands.

### Features

- **Economy** — daily rewards with streak bonuses, hourly jobs, betting, player-to-player transfers
- **Leveling** — XP earned by chatting, level-up announcements with coin rewards
- **Adventure mode** — turn-based monster battles played with buttons (attack / potion / flee), HP with passive regeneration, weapons, armor and loot drops
- **Pets & marriage** — adopt a companion that boosts your coin gains, propose to another member and get married
- **Automatic badges** — profiles display badges earned through progression (level, wealth, victories…)
- **Moderation suite** — kick, ban, timeout, bulk message cleanup, channel slowmode and per-member warnings
- **Community tools** — PvP duels with wagers, rock-paper-scissors against the bot, reaction polls
- **Shop & inventory** — mystery boxes, lottery tickets, potions, equipment, extensible item catalog
- **Server leaderboards** — top 10 by balance, level or total XP
- **Admin toolkit** — role-based access control, economy management, announcements, profile resets
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
| `/utiliser <item>` | Use an item (mystery box, lottery, potion…) |
| `/aventure` | Embark on an adventure and fight a monster |
| `/duel <member> <stake>` | Challenge a member to a wagered duel |
| `/pfc` | Rock-paper-scissors against the bot |
| `/animal voir\|acheter\|nommer\|relacher` | Adopt and care for a pet that boosts your coin gains |
| `/mariage proposer\|statut\|divorcer` | Propose to another member (accept/refuse buttons) |
| `/sondage <question> [choices]` | Create a reaction poll |
| `/piece` | Flip a coin |
| `/de [faces]` | Roll a dice |
| `/8ball <question>` | Ask the magic bot a question |
| `/admin` | Administration — restricted access (see below) |
| `/clear <count> [member]` | Bulk delete messages (optionally from one member) |
| `/kick <member> [reason]` | Kick a member |
| `/ban <member> [reason]` | Ban a member |
| `/timeout <member> <duration> [reason]` | Temporarily mute a member |
| `/slowmode <seconds>` | Set the current channel's slowmode |
| `/warn ajouter\|liste\|retirer` | Manage a member's warnings |

### Administration

Game administration is handled by `/admin`, available to server **administrators** plus any roles explicitly allowed. An administrator grants access with `/admin roles ajouter <role>`, so staff members can moderate the game without full server permissions.

| Subcommand | Description |
|---|---|
| `/admin roles ajouter\|retirer\|liste` | Manage which roles may use `/admin` |
| `/admin argent donner\|retirer <member> <amount>` | Create or remove coins for a member |
| `/admin reinitialiser <member>` | Completely reset a member's profile and inventory |
| `/admin annoncer <title> <message> [#channel]` | Publish an official announcement embed |

Server moderation (`/kick`, `/ban`, `/timeout`, `/clear`, `/slowmode`, `/warn`) relies on Discord's native permissions — but members holding an `/admin` role also gain access, so your staff setup stays consistent across both toolkits. Safety checks are built in: no self-moderation, no action against the server owner or higher-ranked members.

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
│   ├── inventory.ts       # Player inventories
│   ├── guilds.ts          # Per-guild settings (admin roles)
│   └── warnings.ts        # Moderation warnings
├── data/
│   ├── items.ts           # Shop catalog
│   ├── animals.ts         # Pets catalog & bonuses
│   └── monsters.ts        # Adventure monsters
└── utils/                 # Embeds, formatting, randomness
```

### Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Ideas that would fit well: guilds, RPG classes, fishing, seasonal events.

### License

Released under the [MIT](LICENSE) license.

---

<a id="français"></a>

## Français

### À propos du projet

**Qu'est-ce qu'OpenBot ?**

OpenBot est un bot Discord open source développé en TypeScript avec [discord.js](https://discord.js.org) v14. Il apporte à n'importe quel serveur Discord les grandes fonctionnalités de progression — économie, niveaux d'expérience, boutique et mini-jeux — via des commandes slash natives et des embeds personnalisables.

**De quoi se compose-t-il ?**

Le bot propose vingt-huit commandes organisées autour de six systèmes :

- une **économie** : récompense quotidienne avec bonus de série, travail horaire, paris, dons entre joueurs ;
- un **système de niveaux** : XP gagnée en discutant, annonces de montée de niveau avec bonus de pièces, classements par serveur ;
- une **boutique et un inventaire** : consommables, armes et armures, avec un catalogue extensible ;
- un **mode aventure** : combats au tour par tour contre des monstres pilotés par boutons — attaquer, boire une potion ou fuir — avec PV, régénération passive, bonus d'équipement et butin ;
- une **vie sociale** : animaux de compagnie adoptables qui boostent tes gains, demandes en mariage avec boutons d'acceptation, sondages à réactions ;
- des **outils de modération** : kick, ban, timeout, nettoyage de messages, mode lent et système d'avertissements.

Toutes les données sont stockées dans une base SQLite embarquée — aucun serveur de base de données externe n'est nécessaire. Installer le bot revient simplement à cloner le dépôt puis à lancer `npm install`.

**Quel est son but ?**

Les bots de progression populaires comme DraftBot sont très utilisés, mais ils restent fermés et hébergés par quelqu'un d'autre. OpenBot a été créé pour offrir une alternative libre et transparente que chacun peut :

- **héberger soi-même** — les données de ta communauté restent sur ta machine ;
- **personnaliser librement** — chaque cooldown, objet et commande se trouve dans un fichier lisible ; en ajouter un revient à créer un fichier ;
- **utiliser pour apprendre** — le code est volontairement petit et structuré : une bonne base pour découvrir discord.js et TypeScript ;
- **faire évoluer** — les fonctionnalités avancent avec la communauté, sans offre premium ni commandes verrouillées.

### Fonctionnalités

- **Économie** — récompense quotidienne avec bonus de série, travail horaire, paris, dons entre joueurs
- **Niveaux** — XP gagnée en discutant, annonces de montée de niveau avec bonus de pièces
- **Mode aventure** — combats au tour par tour contre des monstres avec boutons (attaquer / potion / fuir), PV avec régénération passive, armes, armures et butin
- **Animaux et mariage** — adopte un compagnon qui booste tes gains de pièces, demande un membre en mariage
- **Badges automatiques** — les profils affichent des badges gagnés via la progression (niveau, richesse, victoires…)
- **Modération** — kick, ban, timeout, suppression en masse, mode lent de salon et avertissements par membre
- **Outils communautaires** — duels avec mise, pierre-feuille-ciseaux contre le bot, sondages à réactions
- **Boutique et inventaire** — boîtes mystère, tickets de loterie, potions, équipement, catalogue extensible
- **Classements du serveur** — top 10 par argent, niveau ou XP totale
- **Outils d'administration** — accès par rôles, gestion de l'économie, annonces, réinitialisation de profils
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
| `/utiliser <objet>` | Utilise un objet (boîte mystère, loterie, potion…) |
| `/aventure` | Pars à l'aventure et affronte un monstre |
| `/duel <adversaire> <mise>` | Défie un membre en duel avec mise |
| `/pfc` | Pierre-feuille-ciseaux contre le bot |
| `/animal voir\|acheter\|nommer\|relacher` | Adopte un animal qui booste tes gains de pièces |
| `/mariage proposer\|statut\|divorcer` | Demande un membre en mariage (boutons accepter/refuser) |
| `/sondage <question> [choix]` | Crée un sondage à réactions |
| `/piece` | Lance une pièce |
| `/de [faces]` | Lance un dé |
| `/8ball <question>` | Pose une question au bot magique |
| `/admin` | Administration — accès restreint (voir ci-dessous) |
| `/clear <nombre> [membre]` | Supprime des messages en masse (d'un seul membre si précisé) |
| `/kick <membre> [raison]` | Expulse un membre |
| `/ban <membre> [raison]` | Bannit un membre |
| `/timeout <membre> <durée> [raison]` | Rend un membre muet temporairement |
| `/slowmode <secondes>` | Définit le mode lent du salon actuel |
| `/warn ajouter\|liste\|retirer` | Gère les avertissements d'un membre |

### Administration

L'administration du jeu passe par `/admin`, réservé aux **administrateurs** du serveur plus les rôles explicitement autorisés. Un administrateur accorde l'accès avec `/admin roles ajouter <role>` : le staff peut ainsi modérer le jeu sans disposer des permissions complètes du serveur.

| Sous-commande | Description |
|---|---|
| `/admin roles ajouter\|retirer\|liste` | Gère les rôles autorisés à utiliser `/admin` |
| `/admin argent donner\|retirer <membre> <montant>` | Crée ou retire des pièces pour un membre |
| `/admin reinitialiser <membre>` | Remet entièrement à zéro le profil et l'inventaire d'un membre |
| `/admin annoncer <titre> <message> [#salon]` | Publie une annonce officielle en embed |

La modération du serveur (`/kick`, `/ban`, `/timeout`, `/clear`, `/slowmode`, `/warn`) s'appuie sur les permissions Discord natives — mais les membres disposant d'un rôle `/admin` y accèdent aussi, pour une organisation du staff cohérente sur les deux tableaux. Des garde-fous sont intégrés : pas d'auto-modération, aucune action possible contre le propriétaire ou les membres mieux gradés.

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

Idées bienvenues : guildes, classes RPG, pêche, événements saisonniers.

### Licence

Distribué sous licence [MIT](LICENSE).
