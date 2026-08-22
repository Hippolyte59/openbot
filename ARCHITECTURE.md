# Architecture Documentation

## Overview

OpenBot is a self-hostable Discord bot written in TypeScript that brings a "progression bot" experience to any server. The project is designed to be lightweight, requiring no external services or premium tiers.

## Technology Stack

| Layer | Technology |
| ----- | ---------- |
| Language | TypeScript (ES2022) |
| Runtime | Node.js (v20+) |
| Framework | discord.js v14 |
| Database | SQLite (embedded, via better-sqlite3) |
| Web Server | Node.js native http module |
| Build Tool | TypeScript Compiler (tsc) |
| Package Manager | pnpm |

## Project Structure

```
src/
├── index.ts              # Entry point: client, intents, events, login
├── deploy.ts             # Slash command deployment script
├── config.ts             # Environment variables & settings
├── loaders.ts            # Automatic command loading
├── types.ts              # Shared types (Command interface)
├── commands/             # One command = one file (auto-loaded)
├── events/               # ready, interactions, message XP, voice lifecycle
├── systems/
│   ├── adventure.ts      # Battle engine (monsters, loot, HP)
│   └── vocal.ts          # Personal voice channels + control panel
├── database/
│   ├── db.ts             # SQLite connection, schema & migrations
│   ├── players.ts        # Balance, XP, levels, equipment, pets
│   ├── inventory.ts      # Player inventories
│   ├── guilds.ts         # Per-guild settings (admin roles)
│   ├── warnings.ts       # Moderation warnings
│   └── voice.ts          # Managed voice channels
├── data/
│   ├── categories.ts     # Command categories shared with the wiki
│   ├── items.ts          # Shop catalog
│   ├── animals.ts        # Pet catalog & coin bonuses
│   └── monsters.ts       # Adventure monsters
├── web/
│   ├── server.ts         # Embedded HTTP server (home, wiki, logo, API)
│   ├── home.ts           # Landing page generator
│   ├── wiki.ts           # Wiki page generator (dark theme, copyable commands)
│   ├── styles.ts         # Shared CSS and copy-to-clipboard script
│   └── logo.ts           # SVG logo, GitHub/author URLs
├── utils/
│   ├── embeds.ts         # Embed creation and formatting
│   ├── formatting.ts     # Randomness, formatting, moderation guards
│   └── moderation.ts     # Permission checks, error handling
└── constants.ts          # Constant values and emoji mappings

dist/
├── index.js              # Compiled entry point
├── deploy.js             # Compiled deploy script
└── *.js                  # Other compiled files

.gitignore
.env                    # Actual environment variables (NOT committed)
.env.example            # Placeholder values (committed)
LICENSE                 # MIT License
README.md               # Project documentation (bilingual EN/FR)
CONTRIBUTING.md         # Contribution guidelines
SECURITY.md             # Vulnerability reporting process
robots.txt              # Search engine optimization
```

## Command Loading System

### How Commands are Loaded

1. **Auto-discovery**: The bot reads all `.ts` files from the `src/commands/` directory
2. **Discord.js Integration**: Each command file exports a Discord.js `SlashCommandBuilder` or `Command` definition
3. **Registration**: Commands are deployed globally or to a specific guild via `pnpm run deploy`
4. **Runtime**: When a user types `/`, Discord lists the available commands with their names and descriptions

### Command File Structure

Each command file exports a Discord.js `ChatInputCommandBuilder` or similar:

```typescript
import { SlashCommandBuilder } from "discord.js";

export const command = new SlashCommandBuilder()
  .setName("nom_de_la_commande")
  .setDescription("🎯 Description avec emoji")
  .addStringOption(option =>
    option.setName("paramètre")
      .setDescription("Description du paramètre")
      .setRequired(true));

module.exports = {
  data: command,
  async execute(interaction) {
    // Command execution logic
  },
};
```

### Command Categories

Commands are organized into categories defined in `src/data/categories.ts`:

| Category ID | Title | Description | Commands |
| ----------- | ----- | ---------- | -------- |
| profil | Profil & classement | Progression, niveaux et statistiques des membres. | profil, classement |
| économie | Économie | Gagne, mise et échange des pièces au quotidien. | quotidiens, travail, parier, donner, boutique, acheter, inventaire, utiliser |
| aventure | Aventure & jeux | Combats au tour par tour et défis contre les autres membres. | aventure, duel, pfc |
| social | Vie sociale | Animaux de compagnie, mariage et sondages communautaires. | animal, mariage, sondage |
| vocal | Salons vocaux | Crée ton propre salon vocal temporaire avec panneau de contrôle. | vocal |
| minijeux | Mini-jeux | Petits jeux rapides pour s'amuser entre deux messages. | piece, de, 8ball |
| modération | Modération | Outils de modération classiques avec garde-fous intégrés. | clear, kick, ban, timeout, slowmode, warn |
| administration | Administration | Gestion du jeu : rôles autorisés, économie, annonces, réinitialisations. | admin |

## Database Schema

### Core Tables

| Table | Purpose | Key Columns |
| ----- | ----- | --------- |
| `players` | Player data (balance, XP, level, equipment) | guild_id, user_id, balance, xp, level, hp, last_activity, created_at |
| `inventory` | Player inventories | guild_id, user_id, item_id, quantity |
| `admin_roles` | Authorized admin roles per guild | guild_id, role_id |
| `warnings` | Moderation warnings | id, guild_id, user_id, reason, moderator_id, created_at |
| `voice_channels` | Managed voice channels | channel_id, guild_id, owner_id, message_id |
| `voice_hubs` | Join-to-create hub channels | guild_id, channel_id |
| `users` | SSO/SSIO user profiles | discord_id, username, avatar, logged_in_at |

### Schema Highlights

- **Embedded SQLite**: No external database server required
- **WAL mode**: Write-ahead logging for better concurrency
- **Primary keys**: Composite keys for guild-specific data (guild_id, user_id)
- **Migrations**: Automatic schema updates via ALTER TABLE statements
- **Data retention**: `last_activity` column tracks last user activity for cleanup

## Web Server Architecture

### Embedded HTTP Server

The bot runs its own HTTP server alongside the Discord client. No reverse proxy is required for local testing.

### Routes

| Route | Description | Authentication |
| ----- | ----------- | ------------- |
| `GET /health` | Bot health check | None |
| `GET /api/commands` | JSON list of all registered commands | None |
| `GET /wiki` | Dark-themed wiki page | None |
| `GET /logo.svg` | Project SVG logo | None |
| `GET /` | Landing page presentation | None |
| `GET /api/user` | User profile (SSO/SSIO) | Session cookie |
| `GET /api/erase` | Data erasure (RGPD) | Session cookie |
| `GET /auth/discord` | Initiate Discord OAuth2 login | None |
| `GET /auth/discord/callback` | OAuth2 callback | None |
| `GET /auth/logout` | SSIO / Logout | None |

### Security Middleware

All routes include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; frame-src 'none';`

### Rate Limiting

- 30 requests per minute per IP address
- Returns HTTP 429 with `{ error: "Rate limit exceeded" }` when exceeded

### Session Management (SSO/SSIO)

- Session cookies set with `HttpOnly; Secure; SameSite=Strict` flags
- Expire after 7 days
- Can be revoked via `/auth/logout`
- User data minimal: Discord ID, username, avatar, login timestamp

## Event System

### Ready Event (`ready.ts`)

- Logs bot connection and guild count
- Sets bot activity to `/aide • open source`
- Starts the web server: `startWebServer(client)`

### Interaction Create Event (`interactionCreate.ts`)

- Handles slash command invocations
- Routes to command executors
- Handles button interactions for voice panels
- Handles modal submissions (voice rename, user limit)

### Message Create Event (`messageCreate.ts`)

- XP generation on message activity
- Command prefix detection (if enabled)
- Cooldown tracking for daily/work commands

### Voice Lifecycle (`voiceStateUpdate.ts`, `channelDelete.ts`)

- Join-to-create hub management
- Automatic voice channel creation
- Panel button handling (lock, hide, rename, close, user limit)
- Channel cleanup when empty

## Data Flow

```
User Interaction
       ↓
Discord API
       ↓
Slash Command Execution
       ↓
Database Query (SQLite)
       ↓
State Update (balance, XP, level, etc.)
       ↓
Embed Response (with emojis)
       ↓
Discord API Response
       ↓
User sees command result
```

```
User joins hub voice channel
       ↓
voiceStateUpdate event
       ↓
Create personal voice channel
       ↓
Post control panel in channel
       ↓
User interacts with panel buttons
       ↓
Database update (permissions, name, limit)
       ↓
Panel updates reflected immediately
```

## Deployment

### Local Development

```bash
# Install dependencies
pnpm install

# Build the TypeScript project
pnpm run build

# Start development mode (auto-restart on changes)
pnpm run dev

# Or start production mode
pnpm run start
```

### Production Deployment

```bash
# Install dependencies
pnpm install

# Build the TypeScript project
pnpm run build

# Deploy commands to Discord
pnpm run deploy

# Start the bot
pnpm run start
```

### Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `DISCORD_TOKEN` | Yes | Bot token from Discord Developer Portal |
| `CLIENT_ID` | Recommended | Application ID (auto-detected by deploy script if omitted) |
| `GUILD_ID` | No | Test server ID for instant deployment |
| `WEB_PORT` | No | Port for embedded web server (default: 3000) |
| `PUBLIC_URL` | No | Public URL for reverse proxy setups |
| `EMBED_COLOR` | No | Embed color in hex (default: #5865F2) |
| `BOT_NAME` | No | Name shown in embed footers (default: OpenBot) |

### Docker (Optional)

The bot can be containerized, but note:
- SQLite database persists in the `data/` volume
- No external services required
- Port 3000 (or configured WEB_PORT) must be exposed

## Known Issues & Limitations

- **Web server behind reverse proxy**: Set `PUBLIC_URL` so links and embed images resolve publicly
- **SVG logo in embeds**: Only appears in `/aide` embed when `PUBLIC_URL` is set to a publicly reachable URL
- **Command count**: Currently 29 slash commands (after `/wiki` removal)
- **Advanced moderation**: Features like ticket systems require additional setup via `src/data/`
- **No Docker support out-of-the-box**: Requires manual volume mounting for `data/`
- **Concurrent writes**: SQLite handles this via WAL mode, but extreme concurrency may need connection pooling

## Future Roadmap

- **SSO/SSIO completion**: Full Discord OAuth2 integration with session management
- **Website redesign**: Modern responsive HTML/CSS with SEO optimization
- **Plugin system**: Allow community-contributed commands without core modifications
- **Advanced logging**: Structured logs with correlation IDs
- **Multi-guild configs**: Per-server configuration without code changes
- **TypeScript strict mode**: Full type safety across all files
- **CI/CD pipeline**: Automated testing and deployment guards

---

## Contributing to Architecture

When adding new features:

1. **Assess data impact**: Review how the feature affects the database schema
2. **Update categories**: Add to `src/data/categories.ts` if it's a command category
3. **Update wiki**: Ensure the wiki reflects the new feature
4. **Update README**: Documentation must stay in sync with code
5. **Run the full pipeline**: `pnpm run build && pnpm run deploy` to verify
6. **Test in Discord**: Verify commands appear with emojis and permissions work
7. **Check security**: Run `npm audit` and review for vulnerabilities
8. **Update this documentation** if architecture concepts change