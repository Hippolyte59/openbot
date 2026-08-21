# Contributing to OpenBot / Contribuer à OpenBot

Thank you for your interest in contributing. This project is open to everyone, beginners and experienced developers alike.

Merci de vouloir contribuer. Ce projet est ouvert à tous, débutants comme confirmés.

## Getting started / Démarrer

```bash
git clone https://github.com/Hippolyte59/openbot.git
cd openbot
npm install
cp .env.example .env   # fill in DISCORD_TOKEN and CLIENT_ID
npm run dev
```

Tip: set `GUILD_ID` in `.env` during development — commands then deploy instantly to your test server with `npm run deploy`.

Astuce : renseigne `GUILD_ID` dans `.env` pendant le développement — les commandes se déploient instantanément sur ton serveur de test avec `npm run deploy`.

## Reporting a bug / Signaler un bug

Open an [issue](https://github.com/Hippolyte59/openbot/issues) including:

- What you did and what happened
- Console error messages, if any
- Your Node.js version

Ouvre une [issue](https://github.com/Hippolyte59/openbot/issues) avec :

- Ce que tu as fait et ce qui s'est passé
- Les messages d'erreur de la console, le cas échéant
- Ta version de Node.js

## Suggesting a feature / Proposer une fonctionnalité

Suggestions are welcome through issues. Useful contributions include:

- New commands in `src/commands/` — copy an existing command and adapt it
- New shop items in `src/data/items.ts`
- Embed or UX improvements

Les suggestions passent par des issues. Les ajouts les plus utiles :

- Nouvelles commandes dans `src/commands/` — copie une commande existante et adapte-la
- Nouveaux objets de boutique dans `src/data/items.ts`
- Améliorations des embeds ou de l'ergonomie

## Before opening a pull request / Avant d'ouvrir une pull request

1. `npm run build` passes without TypeScript errors
2. Test your changes on a real Discord server
3. Describe clearly what your PR does

1. `npm run build` passe sans erreur TypeScript
2. Teste tes changements sur un vrai serveur Discord
3. Décris clairement ce que fait ta PR

Thank you / Merci.
