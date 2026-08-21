# 🤝 Contribuer à OpenBot

Merci de vouloir contribuer ! Ce projet est ouvert à tous, débutants comme confirmés.

## 🚀 Démarrer

```bash
git clone https://github.com/Hippolyte59/openbot.git
cd openbot
npm install
cp .env.example .env   # remplis DISCORD_TOKEN et CLIENT_ID
npm run dev
```

> 💡 Astuce : mets un `GUILD_ID` dans `.env` pendant le développement — les commandes se déploient instantanément sur ton serveur de test avec `npm run deploy`.

## 🐛 Signaler un bug

Ouvre une [issue](https://github.com/Hippolyte59/openbot/issues) avec :

- Ce que tu as fait / ce qui s'est passé
- Les messages d'erreur dans la console (le cas échéant)
- Ta version de Node.js

## 💡 Proposer une fonctionnalité

Les issues "suggestion" sont les bienvenues. Côté code, les ajouts les plus utiles :

- Nouvelles commandes (`src/commands/`) — copie une commande existante et adapte-la
- Nouveaux objets de boutique (`src/data/items.ts`)
- Améliorations des embeds ou de l'ergonomie

## ✅ Avant d'ouvrir ta Pull Request

1. `npm run build` passe sans erreur TypeScript
2. Teste tes changements sur un vrai serveur Discord
3. Décris clairement ce que fait ta PR dans le message

Merci ! 🎉
