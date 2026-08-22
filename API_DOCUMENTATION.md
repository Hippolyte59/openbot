# API Documentation

OpenBot exposes a set of HTTP endpoints via its embedded web server. All endpoints return JSON or HTML responses and include security headers.

## Base URL

```
http://localhost:3000  (or your configured WEB_PORT)
```

When hosted behind a reverse proxy, set the `PUBLIC_URL` environment variable:
```
PUBLIC_URL=https://your-domain.com
```

## Endpoints

### `GET /health`

**Description**: Bot health check endpoint  
**Response**: JSON with status and bot name

```json
{
  "status": "ok",
  "bot": "OpenBot"
}
```

**Headers**: Includes all security headers (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, etc.)

---

### `GET /api/commands`

**Description**: List all registered slash commands with their descriptions  
**Response**: JSON containing count and list of commands

```json
{
  "count": 29,
  "commands": [
    {
      "name": "/profil",
      "description": "👤 View a member's level, XP, balance, badges and more"
    },
    {
      "name": "/classement",
      "description": "🏆 Server top 10 (balance / level / XP)"
    },
    {
      "name": "/quotidien",
      "description": "🎁 Claim your daily reward (streak bonus)"
    },
    {
      "name": "/travail",
      "description": "💼 Earn coins once per hour"
    },
    {
      "name": "/parier",
      "description": "🎲 Coin flip bet: double or lose"
    },
    {
      "name": "/donner",
      "description": "🎁 Give coins to another member"
    },
    {
      "name": "/boutique",
      "description": "🛒 Browse the shop"
    },
    {
      "name": "/acheter",
      "description": "🛍️ Purchase an item"
    },
    {
      "name": "/inventaire",
      "description": "🎒 View your items"
    },
    {
      "name": "/utiliser",
      "description": "✨ Use an item (mystery box, lottery, potion…)"
    },
    {
      "name": "/aventure",
      "description": "🌲 Fight a monster in a button-driven battle"
    },
    {
      "name": "/duel",
      "description": "⚔️ Challenge a member to a wagered duel"
    },
    {
      "name": "/pfc",
      "description": "🪨 Rock-paper-scissors against the bot"
    },
    {
      "name": "/animal",
      "description": "🐾 Adopt and care for a pet that boosts your earnings"
    },
    {
      "name": "/mariage",
      "description": "💍 Propose to another member (buttons)"
    },
    {
      "name": "/sondage",
      "description": "📊 Create a reaction poll"
    },
    {
      "name": "/vocal",
      "description": "🔊 Manage your personal voice channel"
    },
    {
      "name": "/piece",
      "description": "🪙 Flip a coin"
    },
    {
      "name": "/de",
      "description": "🎲 Roll a dice"
    },
    {
      "name": "/clear",
      "description": "🧹 Bulk delete messages"
    },
    {
      "name": "/kick",
      "description": "👢 Kick a member"
    },
    {
      "name": "/ban",
      "description": "🔨 Ban a member"
    },
    {
      "name": "/timeout",
      "description": "🔇 Temporarily mute a member"
    },
    {
      "name": "/slowmode",
      "description": "🐢 Set the current channel's slowmode"
    },
    {
      "name": "/warn",
      "description": "⚠️ Manage a member's warnings"
    },
    {
      "name": "/admin",
      "description": "🛠️ Role-based game administration (below)"
    },
    {
      "name": "/aide",
      "description": "📖 Open the site and the wiki (embed with logo and quick links)"
    }
  ]
}
```

**Security**: Includes all security headers. Rate limited to 30 requests per minute per IP.

**Note**: The `/wiki` command has been removed from Discord slash commands but the `/wiki` web route remains active.

---

### `GET /logo.svg`

**Description**: Project SVG logo  
**Response**: SVG image data

---

### `GET /wiki`

**Description**: Dark-themed wiki page with command list and copyable commands  
**Response**: HTML page

**Features**:
- Commands listed by category
- One-click copy to clipboard for each command
- SSO/SSIO documentation section
- RGPD/privacy documentation section
- Architecture overview
- Known issues and limitations

---

### `GET /`

**Description**: Landing page presenting the project  
**Response**: HTML page

**Features**:
- Project overview and features
- Author card and GitHub link
- Statistics (command count, tech stack)
- Quick start guide
- Links to wiki and API

---

### `GET /api/user`

**Description**: Get the profile of the authenticated user (SSO/SSIO)  
**Response**: JSON with user profile

```json
{
  "discordId": "123456789012345678",
  "username": "Username",
  "avatar": "avatar_url"
}
```

**Authentication**: Requires valid session cookie (`session=...`)  
**Status**: 401 if not authenticated

---

### `GET /api/erase`

**Description**: Right to erasure (RGPD) - delete user data  
**Response**: JSON with success status

```json
{
  "success": true,
  "message": "Data erased successfully"
}
```

**Authentication**: Requires valid session cookie  
**Action**: In production, deletes user data from:
- `players` table (WHERE user_id = discord_id)
- `inventory` table (WHERE user_id = discord_id)
- `warnings` table (WHERE user_id = discord_id)
- `users` table (optionally WHERE discord_id = discord_id)

**Status**: 401 if not authenticated

---

## Security Information

All endpoints include the following security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; img-src 'self'; style-src 'self'; script-src 'self'; frame-src 'none';
```

**Rate Limiting**: 30 requests per minute per IP for all endpoints

**Authentication**: Some endpoints require a session cookie (`session=discord_id`) set via the SSO/SSIO authentication flow.

---

## Errors

All errors return JSON with an `error` field and appropriate HTTP status codes:

- `400` - Bad request (missing parameters)
- `401` - Unauthenticated
- `403` - Forbidden
- `429` - Rate limit exceeded
- `500` - Internal server error

Example error response:
```json
{
  "error": "Missing code parameter"
}
```