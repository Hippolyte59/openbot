<div align="center">

# OpenBot

**Bot Discord open source pour economie, progression et vie communautaire — alternative libre et auto-hebergeable.**

Economie · Niveaux · Aventure · Animaux · Vocaux · Moderation · Interactions · Messages

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![discord.js](https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js&logoColor=white)](https://nodejs.org)

[English](#english) · [Français](#français) · [Wiki](http://localhost:3000/wiki) · [Admin](http://localhost:3000/admin)

</div>

---

<a id="english"></a>

## English

### Overview

OpenBot brings the classic progression bot experience to any Discord server: members earn coins and XP, fight monsters in button-driven battles, adopt pets, marry, claim private voice channels — with a full moderation toolkit. Everything runs from a single Node.js process with an embedded JSON/SQLite store: no external services, no premium tier. Clone, run, own.

|   | OpenBot | Typical hosted bots |
|---|---|---|
| Source | Open (MIT) | Closed |
| Hosting | Your machine | Third party |
| Data | 100% yours | On their servers |
| Customization | Every file editable | Fixed options |
| Locked features | None | Premium |

### Feature highlights

**Progression**
- XP on messages, level-up announcements with coin rewards, per-server leaderboards (balance / level / XP)
- Daily streak and hourly work

**Adventure and fun**
- Turn-based monster battles (attack / potion / flee), HP regen, weapons, armor, loot
- Duels with wagers, rock-paper-scissors, coin flip, dice

**Social**
- Pets that boost coin gains, marriage with buttons, polls, auto badges

**Messages**
- Saved messages: `/message sauvegarder <nom> <contenu>` stores reusable snippets per server, `/message afficher`, `/message liste`, `/message supprimer`. Ideal for rules, templates, lore.
- Message profiles: `/dire <message> [pseudo] [avatar]` sends via webhook with custom pseudo and avatar — per-message identity without changing the bot account.

**Button and Select interactions**
- Native components everywhere: adventure, marriage, polls, voice panel, demo.
- Demo: `/demo boutons` and `/demo select` showcase buttons and StringSelectMenu with handlers in `interactionCreate`.
- All interactions are ephemeral-aware, permission-checked and rate-friendly.

**Advanced interactions**
- Roles: `/autorole`, `/reactionrole`, `/wordreact` + panel `Admin -> Auto` (auto-roles on join, reaction roles, word reactions, custom commands via `!name`)
- Tickets: `/ticket creer <sujet>` creates a private channel, `/ticket fermer`, `/ticket panel` (button to open). Stored in `data/tickets.json`.
- Suggestions: `/suggestion proposer <texte>` with vote buttons Pour/Contre, `/suggestion liste`. Stored in `data/suggestions.json`.
- Shop and articles: `/boutique`, `/acheter`, `/inventaire`, `/utiliser` — catalog in `src/data/items.ts`, extensible.

**Voice channels**
- Join-to-create hub: `/vocal hub creer` — joining creates your private room + control panel (lock, hide, limit, rename, close). Auto transfer and cleanup.

**Moderation and administration**
- `/clear`, `/kick`, `/ban`, `/timeout`, `/slowmode`, `/warn` with hierarchy guards
- `/admin` delegated via roles

**Platform**
- Built-in website: landing `/`, wiki `/wiki` with search and copy, `/api/commands`, `/logo.svg`, admin `/admin`
- Clean embeds with configurable color, consistent footer and timestamps
- Zero DB setup — local `data/` JSON

### Commands

37 slash commands, grouped by category:

| Command | Description |
|---|---|
| `/message sauvegarder/afficher/liste/supprimer` | Saved messages per server |
| `/dire <message> [pseudo] [avatar]` | Send with custom pseudo and avatar (webhook) |
| `/demo boutons/select` | Button and select menu demo |
| `/ticket creer/fermer/panel` | Support tickets |
| `/suggestion proposer/liste` | Community suggestions with votes |
| `/profil [member]` | Level, XP, balance, badges |
| `/classement <type>` | Top 10 |
| `/quotidien` | Daily reward |
| `/travail` | Hourly work |
| `/parier <amount>` | Coin flip bet |
| `/donner <member> <amount>` | Give coins |
| `/boutique` | Shop |
| `/acheter <item>` | Purchase |
| `/inventaire` | Inventory |
| `/utiliser <item>` | Use item |
| `/aventure` | Button battle |
| `/duel <member> <stake>` | Wagered duel |
| `/pfc` | Rock paper scissors |
| `/animal voir/acheter/nommer/relacher` | Pet |
| `/mariage proposer/statut/divorcer` | Marriage |
| `/sondage <question> [choices]` | Poll |
| `/vocal creer/info/supprimer` | Personal voice |
| `/vocal hub creer/definir/retirer` | Hub |
| `/anniv set/serveur/list/remove` | Birthdays |
| `/log <service> <titre> <description>` | Custom logs (YouTube/Twitch/Reddit/Dealabs) |
| `/interserveur creer/rejoindre/quitter/liste/supprimer` | Cross-server bridges |
| `/giveaway` / `/rappel` | Scheduled events |
| `/autorole` / `/custom` / `/reactionrole` / `/wordreact` | Automation |
| `/piece` | Coin flip |
| `/de [faces]` | Dice |
| `/clear` / `/kick` / `/ban` / `/timeout` / `/slowmode` / `/warn` | Moderation |
| `/admin ...` | Game administration |
| `/aide` / `/ping` / `/wiki` | Utilities |

### Personal voice channels

`/vocal hub creer` once, then joining the hub creates your room in the same category with a control panel. Buttons: Lock, Hide, Limit (modal), Rename (modal), Close. Ownership transfers, room deleted when empty. Manual: `/vocal creer [name]`.

### Website and wiki

| Route | Description |
|---|---|
| `/` | Landing with feature grid, comparison, quick start, author |
| `/wiki` | Dark wiki, auto-generated from live commands, search and copy, deep sections (voice, birthdays, logs, objectives, messages, interactions) |
| `/admin` | Per-guild panel: welcome/goodbye, objectives, birthdays, logs, auto, appearance |
| `/api/commands` | JSON list |
| `/logo.svg` | SVG logo |
| `/health` | Probe |

Pages regenerate per request. `WEB_PORT` and `PUBLIC_URL` for reverse proxy.

### Getting started

Requirements: Node.js 20+

1. Discord Developer Portal: Bot -> Reset Token (enable Message Content Intent), General Information -> Application ID
2. Invite: `https://discord.com/oauth2/authorize?client_id=YOUR_APPLICATION_ID&permissions=1099800079446&scope=bot%20applications.commands`
3. Run:
```bash
git clone https://github.com/Hippolyte59/openbot.git
cd openbot
npm install
cp .env.example .env
npm run deploy
npm run build && npm start
# dev: npm run dev
```

### Configuration (.env)

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Bot token |
| `CLIENT_ID` | Recommended | Application ID |
| `GUILD_ID` | No | Test guild for instant deploy |
| `WEB_PORT` | No | Default 3000 |
| `PUBLIC_URL` | No | Public URL behind proxy |
| `EMBED_COLOR` | No | Default #5865F2 |
| `BOT_NAME` | No | Default OpenBot |

### Customization

- Add command: `src/commands/` — auto-loaded, instant wiki listing
- Shop: `src/data/items.ts` · Pet: `src/data/animals.ts` · Monster: `src/data/monsters.ts`
- Economy: `src/config.ts`

---

<a id="français"></a>

## Français

### Aperçu

OpenBot apporte l'experience complete progression a ton serveur: pieces, XP, combats au tour par tour, animaux, mariage, vocaux prives et moderation — dans un seul processus Node avec stockage `data/` local, sans service externe ni premium.

### Points forts

**Progression** — XP en discutant, annonces de niveau avec bonus, classements par serveur, quotidien et travail horaire.

**Aventure** — Batailles a boutons, PV avec regen, armes/armures/butin, duels avec mise, pierre-feuille-ciseaux, pile ou face, des.

**Vie sociale** — Animaux qui boostent les gains, mariage a boutons, sondages, badges.

**Messages**
- Messages sauvegardes: `/message sauvegarder <nom> <contenu>` stocke des snippets reutilisables par serveur (`data/saved_messages.json`), `/message afficher`, `/message liste`, `/message supprimer`.
- Profils de messages: `/dire <message> [pseudo] [avatar]` envoie via webhook avec pseudo et avatar personnalises — identite par message.

**Interactions boutons et selecteur**
- Composants natifs partout: aventure, mariage, sondages, panel vocal, demo.
- Demo: `/demo boutons` et `/demo select` montrent boutons et menu select avec handlers centralises.

**Interactions avancees**
- Roles: `/autorole`, `/reactionrole`, `/wordreact`, panel `Admin -> Auto` (roles auto a l'arrivee, roles a reaction, reactions sur mots, commandes custom `!nom` avec placeholders `{pseudo} {mention} {server_name} {memberCount} {args}`)
- Tickets: `/ticket creer <sujet>` cree un salon prive, `/ticket fermer`, `/ticket panel` (bouton d'ouverture). Persistance `data/tickets.json`.
- Suggestions: `/suggestion proposer <texte>` avec boutons Pour/Contre et comptage, `/suggestion liste`. Persistance `data/suggestions.json`.
- Boutique et articles: `/boutique`, `/acheter`, `/inventaire`, `/utiliser` — catalogue `src/data/items.ts`.

**Salons vocaux** — Hub rejoindre-pour-creer (`/vocal hub creer`), panel de controle, transfert et suppression auto.

**Moderation et administration** — `/clear` `/kick` `/ban` `/timeout` `/slowmode` `/warn` avec garde-fous, `/admin` delegue par roles.

**Plateforme** — Site integre: accueil, wiki avec recherche et copie, `/api/commands`, `/logo.svg`, panel `/admin`. Embeds coherents, zero config DB.

### Commandes

37 commandes slash reparties par categorie (voir tableau anglais pour la liste detaillee).

### Salons vocaux personnels

Meme fonctionnement que decrit en anglais: hub unique, creation instantanee, panel a 5 boutons, regles automatiques.

### Site et wiki integres

| Route | Description |
|---|---|
| `/` | Accueil sans emojis, grille des fonctionnalites, comparatif, demarrage eclair, auteur |
| `/wiki` | Wiki sombre sans emojis, genere depuis les commandes live, recherche, copie en un clic, sections detaillees (vocaux, anniversaires, logs, objectifs, messages, interactions) |
| `/admin` | Panel par serveur: bienvenue/au revoir, objectifs, anniversaires, auto, logs, apparence |
| `/api/commands` | JSON |
| `/logo.svg` | Logo SVG |
| `/health` | Sonde |

Regeneration a chaque requete. `WEB_PORT` / `PUBLIC_URL`.

### Mise en place

Prerequis: Node.js 20+

1. Portail developpeur Discord: Bot -> Reset Token (activer Message Content Intent), General Information -> Application ID
2. Invitation: `https://discord.com/oauth2/authorize?client_id=TON_APPLICATION_ID&permissions=1099800079446&scope=bot%20applications.commands`
3. Installation:
```bash
git clone https://github.com/Hippolyte59/openbot.git
cd openbot
npm install
cp .env.example .env
npm run deploy
npm run build && npm start
```

### Configuration (.env)

| Variable | Obligatoire | Description |
|---|---|---|
| `DISCORD_TOKEN` | Oui | Token du bot |
| `CLIENT_ID` | Recommande | Application ID |
| `GUILD_ID` | Non | Serveur de test |
| `WEB_PORT` | Non | Defaut 3000 |
| `PUBLIC_URL` | Non | URL publique derriere proxy |
| `EMBED_COLOR` | Non | Defaut #5865F2 |
| `BOT_NAME` | Non | Defaut OpenBot |

### Personnalisation

Ajouter une commande dans `src/commands/`, un objet dans `src/data/items.ts`, un animal dans `src/data/animals.ts`, un monstre dans `src/data/monsters.ts`, regler l'economie dans `src/config.ts`.

### Licence

MIT — voir `LICENSE`.

---

## Documentation

- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- API: `/api/commands` et `/wiki`
- Securite: [SECURITY.md](SECURITY.md)
- Contribution: [CONTRIBUTING.md](CONTRIBUTING.md)
