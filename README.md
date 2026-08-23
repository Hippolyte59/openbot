<div align="center">

# OpenBot

**An open-source Discord bot for economy, progression and community life — a free, self-hostable alternative to DraftBot.**

Economy · Leveling · Adventure · Pets · Voice channels · Moderation

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/storage-SQLite%20embedded-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)

[English](#english) · [Français](#français)

</div>

---

<a id="english"></a>

## English

### Overview

OpenBot brings the classic "progression bot" experience to any Discord server: members earn coins and experience, fight monsters in turn-based battles, adopt pets, marry each other, claim their own voice channels — while your staff gets a complete moderation toolkit.

Everything runs from a single Node.js process with an **embedded SQLite database**: no external services, no dashboard to configure, no premium tier. Clone it, run it, own it.

|   | OpenBot  | Typical hosted bots |
| ------------------ | ------------------ | ------------------- |
| Source code | Open (MIT)  | Closed  |
| Hosting  | Your machine | Third party  |
| Data ownership | 100 % yours | On their servers |
| Customization | Every file editable| Fixed options |
| Locked features | None  | Premium tiers |

### Feature highlights

**Progression**

- XP earned by chatting, level-up announcements with coin rewards
- Daily rewards with streak bonuses and hourly paid jobs
- Per-server leaderboards by balance, level or total XP

**Adventure & fun**

- Turn-based monster battles driven by buttons — attack, drink a potion or flee
- HP with passive regeneration, weapons, armor and loot drops
- PvP duels with wagers, rock-paper-scissors, coin flips and dice rolls

**Social life**

- Adoptable pets that boost every coin gain (dog, owl, wolf, baby dragon…)
- Marriage proposals with accept/refuse buttons, divorce for a fee
- Reaction polls and automatic profile badges (veteran, rich, hero…)

**Voice channels**

- Join-to-create hub: entering it instantly opens your own private room
- A control panel with buttons: lock, hide, user limit, rename, close
- Ownership transfer when the owner leaves; automatic deletion when empty

**Moderation & administration**

- Kick, ban, timeout, bulk message cleanup, channel slowmode
- Per-member warning system stored in the database
- Game administration (`/admin`) delegated through configured roles

**Platform**

- Built-in website: landing page, dark-themed wiki with one-click copyable commands, SVG logo
- JSON endpoint listing all commands (`/api/commands`)
- Clean embeds with configurable color, consistent footer and timestamps
- Zero database setup — one local SQLite file

### Commands

29 commands, grouped by category:

| Command | Description |
|---|---|
| `/profil [member]` | View a member's level, XP, balance, badges and more |
| `/classement <type>` | Server top 10 (balance / level / XP) |
| `/quotidien` | Claim your daily reward (streak bonus) |
| `/travail` | Earn coins once per hour |
| `/parier <amount>` | Coin flip bet: double or lose |
| `/donner <member> <amount>` | Give coins to another member |
| `/boutique` | Browse the shop |
| `/acheter <item> [quantity]` | Purchase an item |
| `/inventaire` | View your items |
| `/utiliser <item>` | Use an item (mystery box, lottery, potion…) |
| `/aventure` | Fight a monster in a button-driven battle |
| `/duel <member> <stake>` | Challenge a member to a wagered duel |
| `/pfc` | Rock-paper-scissors against the bot |
| `/animal voir\|acheter\|nommer\|relacher` | Adopt and care for a pet that boosts your earnings |
| `/mariage proposer\|statut\|divorcer` | Propose to another member (buttons) |
| `/sondage <question> [choices]` | Create a reaction poll |
| `/vocal creer\|info\|supprimer` | Manage your personal voice channel |
| `/vocal hub creer\|definir\|retirer` | Configure the server's join-to-create channel |
| `/piece` | Flip a coin |
| `/de [faces]` | Roll a dice |
| `/clear <count> [member]` | Bulk delete messages |
| `/kick <member> [reason]` | Kick a member |
| `/ban <member> [reason]` | Ban a member |
| `/timeout <member> <duration> [reason]` | Temporarily mute a member |
| `/slowmode <seconds>` | Set the current channel's slowmode |
| `/warn ajouter\|liste\|retirer` | Manage a member's warnings |
| `/admin …` | Role-based game administration (below) |
| `/aide` | Open the site and the wiki (embed with logo and quick links) |

| `/ping` | Show bot latency |

### Personal voice channels

The flagship flow is **join-to-create**: the staff sets up a hub channel once with `/vocal hub creer` (or turns an existing channel into one with `/vocal hub definir`). From then on, whenever a member **joins that channel, they are instantly redirected into their own fresh voice room** — created in the same category, named after them — and the control panel is posted right in the room's text chat.

| Panel button | Effect |
|---|---|
| Lock / Unlock | Allow or deny `Connect` for everyone |
| Hide / Show | Make the channel invisible (or visible) to members |
| User limit | Opens a modal to set a capacity (0 = unlimited) |
| Rename | Opens a modal to rename the channel |
| Close | Deletes the channel immediately |

House rules are handled automatically: joining the hub while already owning a room simply teleports you back to it, the panel is usable **only by the owner**, ownership transfers to the next member when the owner leaves, and the room is **deleted once empty**. Prefer manual creation? `/vocal creer [name]` still works anywhere.

### Built-in website & wiki

The bot starts its own HTTP server alongside Discord — no reverse proxy required to try it locally:

| Route | Description |
|---|---|
| `/` | Landing page: project presentation, feature overview, author card, stats |
| `/wiki` | Dark-themed wiki, auto-generated from the live command list — **click any command to copy it** |
| `/logo.svg` | The project logo (SVG), also used in the `/aide` embed |
| `/api/commands` | JSON list of every registered command |
| `/health` | Simple availability probe |

`/aide` posts an embed with the logo, a timestamp and direct buttons to the site, the wiki and GitHub. Pages regenerate on each request so they always reflect the running bot. Set the port with `WEB_PORT`; when hosting behind a reverse proxy, set `PUBLIC_URL` so links and embed images resolve publicly.

### Administration & moderation

Game administration is handled by `/admin`, available to server **administrators** plus any roles explicitly allowed via `/admin roles ajouter`. Staff can manage roles, mint or remove coins, reset profiles and publish announcements without full server permissions.

Server moderation (`/kick`, `/ban`, `/timeout`, `/clear`, `/slowmode`, `/warn`) relies on native Discord permissions — but members holding an `/admin` role also gain access. Safety checks are built in: no self-moderation, no action against the owner or higher-ranked members.

### Getting started

**Requirements:** [Node.js](https://nodejs.org/) 20 or later.

1. Create the application on the [Discord Developer Portal](https://discord.com/developers/applications):
 - **Bot** tab: *Reset Token*, copy the token, enable the privileged **Message Content Intent**
 - **General Information**: copy the **Application ID**
2. Invite the bot:

 ```
 https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=1099800079446&scope=bot%20applications.commands
 ```

3. Install and run:

 ```bash
 git clone https://github.com/Hippolyte59/openbot.git
 cd openbot

 npm install  # or: pnpm install
 cp .env.example .env # fill in DISCORD_TOKEN and CLIENT_ID

 npm run deploy # register slash commands with Discord
 npm run build && npm start

 # development mode (auto-restart):
 npm run dev
 ```

### Configuration (.env)

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Bot token (Developer Portal → Bot) |
| `CLIENT_ID` | Recommended | Application ID — auto-detected by `npm run deploy` if omitted |
| `GUILD_ID` | No | Test server ID: deploys commands instantly instead of waiting up to 1 h |
| `WEB_PORT` | No | Port of the embedded web server (default: `3000`) |
| `PUBLIC_URL` | No | Public URL of the wiki behind a reverse proxy |
| `EMBED_COLOR` | No | Embed color in hexadecimal (default: `#5865F2`) |
| `BOT_NAME` | No | Name shown in embed footers (default: `OpenBot`) |

### Customization

- **Add a command**: drop a file in `src/commands/` following existing examples — loaded automatically, listed in the wiki instantly
- **Add a shop item**: edit `src/data/items.ts`
- **Add a pet**: edit `src/data/animals.ts`
- **Add a monster**: edit `src/data/monsters.ts`
- **Tune the economy**: cooldowns and XP rates live in `src/config.ts`

### Project structure

```
src/
├── index.ts  # Entry point: client, intents, events, login
├── deploy.ts  # Slash command deployment script
├── config.ts  # Environment variables & settings
├── loaders.ts  # Automatic command loading
├── types.ts  # Shared types (Command interface…)
├── commands/  # One command = one file (auto-loaded)
├── events/  # ready, interactions, message XP, voice lifecycle
├── systems/
│ ├── adventure.ts # Battle engine (monsters, loot, HP)
│ └── vocal.ts  # Personal voice channels + control panel
├── database/
│ ├── db.ts  # SQLite connection, schema & migrations
│ ├── players.ts  # Balance, XP, levels, equipment, pets…
│ ├── inventory.ts # Player inventories
│ ├── guilds.ts  # Per-guild settings (admin roles)
│ ├── warnings.ts # Moderation warnings
│ └── voice.ts  # Managed voice channels
├── data/
│ ├── categories.ts # Command categories shared with the wiki
│ ├── items.ts  # Shop catalog
│ ├── animals.ts  # Pet catalog & coin bonuses
│ └── monsters.ts # Adventure monsters
├── web/
│ ├── server.ts  # Embedded HTTP server (home, wiki, logo, API)
│ ├── home.ts  # Landing page generator
│ ├── wiki.ts  # Wiki page generator (dark theme, copyable commands)
│ ├── styles.ts  # Shared CSS and copy-to-clipboard script
│ └── logo.ts  # SVG logo, GitHub/author URLs
└── utils/   # Embeds, formatting, randomness, moderation guards
```

### Contributing

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md). Ideas that would fit well: guilds, RPG classes, fishing, seasonal events.

### License

Released under the [MIT](LICENSE) license.

---

<a id="français"></a>

## Français

### Aperçu

OpenBot apporte l'expérience complète d'un « bot de progression » à n'importe quel serveur Discord : les membres gagnent des pièces et de l'expérience, affrontent des monstres au tour par tour, adoptent des animaux, se marient, revendiquent leur propre salon vocal — pendant que ton staff dispose d'une panoplie de modération complète.

Tout tourne dans un seul processus Node.js avec une **base SQLite embarquée** : aucun service externe, aucun tableau de bord à configurer, aucune offre premium. Tu clones, tu lances, tu possèdes.

|   | OpenBot  | Bots hébergés classiques |
| ------------------ | ------------------ | ------------------------ |
| Code source | Ouvert (MIT) | Fermé   |
| Hébergement | Ta machine  | Un tiers   |
| Données  | 100 % chez toi | Sur leurs serveurs |
| Personnalisation | Chaque fichier | Options figées  |
| Fonctions verrouillées | Aucune  | Offres premium  |

### Points forts

**Progression**

- XP gagnée en discutant, annonces de montée de niveau avec pièces bonus
- Récompense quotidienne avec série et travail rémunéré chaque heure
- Classements par serveur : argent, niveau ou XP totale

**Aventure & divertissement**

- Combats au tour par tour pilotés par boutons — attaquer, potion ou fuir
- PV avec régénération passive, armes, armures et butin
- Duels avec mise, pierre-feuille-ciseaux, pile ou face et dés

**Vie sociale**

- Animaux adoptables qui boostent chaque gain de pièces (chien, hibou, loup, bébé dragon…)
- Demandes en mariage avec boutons accepter/refuser, divorce payant
- Sondages à réactions et badges automatiques sur les profils

**Salons vocaux**

- Salon hub « rejoindre pour créer » : y entrer ouvre instantanément ton vocal perso
- Panneau de contrôle à boutons : verrouiller, cacher, places, renommer, fermer
- Transfert de propriété quand le propriétaire part ; suppression automatique si vide

**Modération & administration**

- Kick, ban, timeout, suppression en masse, mode lent de salon
- Système d'avertissements par membre stocké en base
- Administration du jeu (`/admin`) déléguée via des rôles configurés

**Plateforme**

- Site web intégré : page d'accueil, wiki sombre aux commandes copiables en un clic, logo SVG
- Endpoint JSON listant toutes les commandes (`/api/commands`)
- Embeds soignés avec couleur configurable, footer et horodatage cohérents
- Zéro configuration de base — un simple fichier SQLite local

### Commandes

29 commandes, regroupées par catégorie :

| Commande | Description |
|---|---|
| `/profil [membre]` | Niveau, XP, argent, badges et équipement d'un membre |
| `/classement <type>` | Top 10 du serveur (argent / niveau / XP) |
| `/quotidien` | Récompense quotidienne (bonus de série) |
| `/travail` | Gagne des pièces une fois par heure |
| `/parier <montant>` | Pari pile ou face : double ou perd |
| `/donner <membre> <montant>` | Offre des pièces à un membre |
| `/boutique` | Affiche la boutique |
| `/acheter <objet> [quantité]` | Achète un objet |
| `/inventaire` | Affiche tes objets |
| `/utiliser <objet>` | Utilise un objet (boîte mystère, loterie, potion…) |
| `/aventure` | Combat un monstre dans une bataille à boutons |
| `/duel <membre> <mise>` | Défie un membre en duel avec mise |
| `/pfc` | Pierre-feuille-ciseaux contre le bot |
| `/animal voir\|acheter\|nommer\|relacher` | Adopte un animal qui booste tes gains |
| `/mariage proposer\|statut\|divorcer` | Demande un membre en mariage (boutons) |
| `/sondage <question> [choix]` | Crée un sondage à réactions |
| `/vocal creer\|info\|supprimer` | Gère ton salon vocal personnel |
| `/vocal hub creer\|definir\|retirer` | Configure le salon « rejoindre pour créer » du serveur |
| `/piece` | Lance une pièce |
| `/de [faces]` | Lance un dé |
| `/clear <nombre> [membre]` | Supprime des messages en masse |
| `/kick <membre> [raison]` | Expulse un membre |
| `/ban <membre> [raison]` | Bannit un membre |
| `/timeout <membre> <durée> [raison]` | Rend un membre muet temporairement |
| `/slowmode <secondes>` | Définit le mode lent du salon actuel |
| `/warn ajouter\|liste\|retirer` | Gère les avertissements d'un membre |
| `/admin …` | Administration du jeu par rôles (ci-dessous) |
| `/aide` | Ouvre le site et le wiki (embed avec logo et liens rapides) |

| `/ping` | Affiche la latence du bot |

### Salons vocaux personnels

Le fonctionnement phare est le **« rejoindre pour créer »** : le staff place une fois un salon hub avec `/vocal hub creer` (ou transforme un salon existant avec `/vocal hub definir`). Ensuite, dès qu'un membre **entre dans ce salon, il est instantanément redirigé vers son propre vocal tout neuf** — créé dans la même catégorie, nommé à son nom — et le panneau de contrôle apparaît directement dans le chat du salon.

| Bouton du panneau | Effet |
|---|---|
| Verrouiller / Déverrouiller | Autorise ou interdit `Se connecter` à tous |
| Cacher / Afficher | Rend le salon invisible (ou visible) aux membres |
| Places | Ouvre une modale pour fixer la capacité (0 = illimité) |
| Renommer | Ouvre une modale pour renommer le salon |
| Fermer | Supprime immédiatement le salon |

Les règles sont automatiques : entrer dans le hub en possédant déjà un salon te téléporte simplement vers lui, le panneau n'est utilisable **que par le propriétaire**, la propriété est transférée au membre suivant si le propriétaire part, et le salon est **supprimé dès qu'il devient vide**. Tu préfères la création manuelle ? `/vocal creer [nom]` fonctionne toujours partout.

### Site et wiki intégrés

Le bot démarre son propre serveur HTTP en même temps que Discord — aucun reverse proxy nécessaire pour tester en local :

| Route | Description |
|---|---|
| `/` | Page d'accueil : présentation du projet, points forts, carte de l'auteur, statistiques |
| `/wiki` | Wiki au thème sombre, généré depuis la liste des commandes en direct — **clique une commande pour la copier** |
| `/logo.svg` | Le logo du projet (SVG), également utilisé dans l'embed de `/aide` |
| `/api/commands` | Liste JSON de toutes les commandes enregistrées |
| `/health` | Sonde de disponibilité |

`/aide` publie un embed avec le logo, l'horodatage et des boutons directs vers le site, le wiki et GitHub. Les pages se régénèrent à chaque requête : elles reflètent toujours le bot en cours d'exécution. Règle le port avec `WEB_PORT` ; derrière un reverse proxy, renseigne `PUBLIC_URL` pour que les liens et images d'embed restent accessibles publiquement.

### Administration & modération

L'administration du jeu passe par `/admin`, réservé aux **administrateurs** plus les rôles autorisés via `/admin roles ajouter`. Le staff peut gérer les rôles, créer ou retirer des pièces, réinitialiser des profils et publier des annonces sans disposer des permissions complètes du serveur.

La modération du serveur (`/kick`, `/ban`, `/timeout`, `/clear`, `/slowmode`, `/warn`) s'appuie sur les permissions Discord natives — mais les membres disposant d'un rôle `/admin` y accèdent aussi. Des garde-fous sont intégrés : pas d'auto-modération, aucune action contre le propriétaire ou les membres mieux gradés.

### Mise en place

**Prérequis :** [Node.js](https://nodejs.org/) 20 ou supérieur.

1. Crée l'application sur le [Discord Developer Portal](https://discord.com/developers/applications) :
 - Onglet **Bot** : *Reset Token*, copie le token, active l'intent privilégié **Message Content Intent**
 - Onglet **General Information** : copie l'**Application ID**
2. Invite le bot :

 ```
 https://discord.com/oauth2/authorize?client_id=TON_APPLICATION_ID&permissions=1099800079446&scope=bot%20applications.commands
 ```

3. Installe et lance :

 ```bash
 git clone https://github.com/Hippolyte59/openbot.git
 cd openbot

 npm install  # ou : pnpm install
 cp .env.example .env # remplis DISCORD_TOKEN et CLIENT_ID

 npm run deploy # enregistre les commandes slash sur Discord
 npm run build && npm start

 # mode développement (redémarrage automatique) :
 npm run dev
 ```

### Configuration (.env)

| Variable | Obligatoire | Description |
|---|---|---|
| `DISCORD_TOKEN` | Oui | Token du bot (Developer Portal → Bot) |
| `CLIENT_ID` | Recommandé | Application ID — déduit automatiquement par `npm run deploy` si absent |
| `GUILD_ID` | Non | ID d'un serveur de test : déploie instantanément au lieu d'attendre ~1 h |
| `WEB_PORT` | Non | Port du serveur web intégré (défaut : `3000`) |
| `PUBLIC_URL` | Non | URL publique du wiki derrière un reverse proxy |
| `EMBED_COLOR` | Non | Couleur des embeds en hexadécimal (défaut : `#5865F2`) |
| `BOT_NAME` | Non | Nom affiché dans le pied des embeds (défaut : `OpenBot`) |

### Personnalisation

- **Ajouter une commande** : crée un fichier dans `src/commands/` sur le modèle des existantes — chargé automatiquement et listé dans le wiki instantanément
- **Ajouter un objet** : modifie `src/data/items.ts`
- **Ajouter un animal** : modifie `src/data/animals.ts`
- **Ajouter un monstre** : modifie `src/data/monsters.ts`
- **Ajuster l'économie** : cooldowns et gains d'XP dans `src/config.ts`

### Structure du projet

Voir la section [anglaise](#english) pour l'arborescence détaillée.

### Contribuer

Les contributions sont les bienvenues — consulte [CONTRIBUTING.md](CONTRIBUTING.md). Idées bienvenues : guildes, classes RPG, pêche, événements saisonniers.

### Licence

Distribué sous licence [MIT](LICENSE).

---

## Open Source & Documentation

### English

**Project presentation**
OpenBot is an open-source Discord bot designed to bring a full "progression bot" experience to any server: economy, leveling, adventure, pets, voice channels and moderation. It is self-hostable, uses an embedded SQLite database, and requires no external services or premium tiers.

**Architecture**
- **TypeScript** (ES2022) strict mode, compiled to `dist/`
- Commands are auto-loaded from `src/commands/` directory
- Events handle ready, interactions, message XP and voice lifecycle
- Embedded HTTP web server provides landing page, wiki, API endpoints and SVG logo
- SQLite database schema: players, inventory, admin roles, warnings, voice channels, voice hubs
- Command loading via `src/loaders.ts`, discriminant based on slash command name

**API**
- `GET /health` — bot health check with status and name
- `GET /api/commands` — JSON list of all registered slash commands (names and descriptions)
- `GET /logo.svg` — project SVG logo
- `GET /wiki` — dark‑themed wiki page with command list and one‑click copy
- `GET /` — landing page presenting the project, features, author card and stats

**SSO / SSIO (Single Sign‑On / Single Sign‑Out)**
- Authentication via Discord OAuth2: users log in with their Discord account
- Session tokens stored HttpOnly, Secure, SameSite=Strict
- Minimal profile data saved: Discord ID, username, avatar, join date
- Role/permission system linked to Discord roles configured via `/admin roles`
- SSIO: automatic logout when Discord session expires; revoke tokens from web interface

**RGPD & confidentialité**
- Data minimisation: only store Discord ID, balance, XP, non‑sensitive profile data
- No token, secret or personal message content is persisted
- Data retention config: warnings older than 90 days are auto‑purged; inactive player data after 365 days
- “Right to erasure” endpoint concept: users can request deletion of their data via a web route (to be implemented per deployment)
- Logs are sanitised: no Discord usernames, IDs or token values are written; mask sensitive fields
- Cookie consent banner if any cookies are set (currently none; add if needed)
- Privacy‑by‑design: new features must be assessed for data impact before implementation

**Known issues & limitations**
- Web server is embedded; behind a reverse proxy set `PUBLIC_URL` so links and embed images resolve publicly
- SVG logo only appears in `/aide` embed when `PUBLIC_URL` is set to a publicly reachable URL
- Some advanced moderation features (e.g., ticket systems) require additional setup via `src/data/`
- Bot currently supports 29 slash commands; further commands can be added by creating a new file in `src/commands/`

**Contributing**
- Fork the repository, create a feature branch, write tests if applicable
- Follow the existing TypeScript strict conventions; run `npm run build` and `npm run deploy`
- Commit messages follow conventional commits format
- Submit a pull request; maintainers will review and merge
- See `CONTRIBUTING.md` for detailed guidelines (link at bottom of this file)

**License**
Distributed under the [MIT](LICENSE) license. See `LICENSE` for full text.

### Français

**Présentation du projet**
OpenBot est un bot Discord open source conçu pour offrir une expérience complète de « bot de progression » sur n'importe quel serveur : économie, niveaux, aventure, animaux, salons vocaux et modération. Il est auto-hébergeable, utilise une base SQLite embarquée et ne nécessite aucun service externe ni offre premium.

**Architecture**
- **TypeScript** (ES2022) en mode strict, compilé vers `dist/`
- Les commandes sont chargées automatiquement depuis le dossier `src/commands/`
- Événements gérant le ready, les interactions, les messages XP et le cycle de vie vocal
- Serveur HTTP embarqué fournissant la page d'accueil, le wiki, les points d'entrée d'API et le logo SVG
- Schéma SQLite : joueurs, inventaire, rôles admin, avertissements, salons vocaux, hubs vocaux
- Chargement des commandes via `src/loaders.ts`, discriminant selon le nom de la commande slash

**API**
- `GET /health` — vérification de l'état du bot avec status et nom
- `GET /api/commandes` — liste JSON de toutes les commandes slash enregistrées (noms et descriptions)
- `GET /logo.svg` — logo SVG du projet
- `GET /wiki` — page wiki au thème sombre avec liste de commandes et copie en un clic
- `GET /` — page d'accueil présentant le projet, les fonctionnalités, la carte de l'auteur et les statistiques

**SSO / SSIO (Identifiant unique / Déconnexion unique)**
- Authentification via OAuth2 Discord : les utilisateurs se connectent avec leur compte Discord
- Jetons de session stockés en HttpOnly, Secure, SameSite=Strict
- Données de profil minimales enregistrées : ID Discord, nom d'utilisateur, avatar, date d'adhésion
- Système de rôles et permissions lié aux rôles Discord configurés via `/admin roles`
- SSIO : déconnexion automatique lorsque la session Discord expire ; révocation des tokens depuis l'interface web

**RGPD & confidentialité**
- Minimisation des données : ne conserver que l'ID Discord, le solde, l'XP et des données de profil non sensibles
- Aucun token, secret ou contenu de message personnel n'est persisté
- Configuration de rétention des données : les avertissements de plus de 90 jours sont automatiquement purgés ; les données de joueurs inactives après 365 jours
- Concept de « droit à l'oubli » : les utilisateurs peuvent demander la suppression de leurs données via une route web (à implémenter selon le déploiement)
- Les journaux sont assainis : aucun nom d'utilisateur Discord, ID ou valeur de token n'est consigné ; masquer les champs sensibles
- Consentement cookie si des cookies sont définis (actuellement aucun ; à ajouter si nécessaire)
- Privacy‑by‑design : chaque nouvelle fonctionnalité doit être évaluée pour son impact sur les données avant implantation

**Problèmes connus & limitations**
- Le serveur web est embarqué ; derrière un reverse proxy, pensez à définir `PUBLIC_URL` afin que les liens et images d'embed soient accessibles publiquement
- Le logo SVG n'apparaît dans l'embed `/aide` que si `PUBLIC_URL` est défini sur une URL publiquement joignable
- Certaines fonctionnalités avancées de modération (ex. systèmes de tickets) nécessitent une configuration supplémentaire via `src/data/`
- Le bot supporte actuellement 29 commandes slash ; de nouvelles commandes peuvent être ajoutées en créant un nouveau fichier dans `src/commands/`

**Contribuer**
- Fork le dépôt, créez une branche de fonctionnalité, rédigez des tests le cas échéant
- Respectez les conventions TypeScript strictes existantes ; exécutez `pnpm run build` et `pnpm run deploy`
- Les messages de commit suivent le format conventional commits
- Soumettez une pull request ; les maintenants examineront et fusionneront
- Consultez `CONTRIBUTING.md` pour les directives détaillées (lien en bas de ce fichier)

**Licence**
Distribué sous licence [MIT](LICENSE). Voir le fichier `LICENSE` pour le texte complet.

---

### Contribution (lien vers CONTRIBUTING.md)

Les contributions sont les bienvenues — consulte [CONTRIBUTING.md](CONTRIBUTING.md). Idées bienvenues : guildes, classes RPG, pêche, événements saisonniers.

### Licence

Distribué sous licence [MIT](LICENSE).



## Documentation Open Source

- **Architecture** : [ARCHITECTURE.md](ARCHITECTURE.md)
- **API** : disponible sur le site web [`/api/commands`](https://your-domain.com/api/commands) et [`/wiki`](https://your-domain.com/wiki) — voir aussi [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Sécurité** : [SECURITY.md](SECURITY.md)
- **Contribution** : [CONTRIBUTING.md](CONTRIBUTING.md)

