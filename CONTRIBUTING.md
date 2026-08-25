# Contributing to OpenBot

Thank you for considering contributing to OpenBot! This open-source Discord bot welcomes contributions from the community. Please read through this guide to learn about the development process, how to submit pull requests, and coding standards.

## Code of Conduct

- Be respectful and inclusive in all interactions
- Help create a welcoming environment for everyone
- Follow the project's code of conduct at all times

## Development Workflow

1. **Fork the repository**
   - Click the "Fork" button on the GitHub page

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up the development environment**
   ```bash
   # Install dependencies
   pnpm install

   # Build the project
   pnpm run build

   # Deploy commands to Discord
   pnpm run deploy
   ```

4. **Make your changes**
   - Follow the existing code style and conventions
   - Write tests if applicable
   - Update the README.md if your changes affect documentation
   - Update the wiki if your changes affect commands or features

5. **Test your changes**
   ```bash
   # Run the development server
   pnpm run dev
   ```

   - Test all commands in Discord: `/` shows commands with emojis
   - Verify permissions work correctly
   - Test admin-only commands are restricted

6. **Commit your changes**
   - Follow Conventional Commits format: `type: description`
   - Example: `feat: add new command`, `fix: fix permission check`, `docs: update README`

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Submit a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your feature branch
   - Fill in the PR template
   - Ensure all checks pass

## Branching Model

- **main**: Production-ready code, only merged after successful review and testing
- **feature/\***: New features
- **bugfix/\***: Bug fixes
- **hotfix/\***: Critical bug fixes for production

## Pull Request Guidelines

### Requirements
- [ ] Code follows the project's TypeScript strict conventions
- [ ] `pnpm run build` compiles without errors
- [ ] `pnpm run deploy` successfully registers commands
- [ ] All commands tested in Discord
- [ ] README.md updated if user-facing changes
- [ ] No secrets or tokens in commit messages or code
- [ ] CHANGELOG.md (if applicable) updated

### PR Template

```markdown
## Description
Brief description of the change and the problem it solves.

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Documentation
- [ ] Security Fix
- [ ] Refactor
- [ ] Other

## Checklist
- [ ] Code compiles (`pnpm run build`)
- [ ] Commands deploy successfully (`pnpm run deploy`)
- [ ] Tested in Discord
- [ ] No secrets exposed
- [ ] Documentation updated

## Screenshots/GIFs
(Optional) Add screenshots or GIFs demonstrating the changes.

## Checklist
- [ ] New/updated commands have emojis in descriptions
- [ ] Permissions are correct
- [ ] No breaking changes (or documented breaking changes)
```

## Coding Standards

### TypeScript
- Use strict mode settings as defined in `tsconfig.json`
- All new files must include JSDoc comments for public functions
- Avoid `any` type; use specific types instead
- Export interfaces and types for external use

### JavaScript/Node.js
- Use `const` and `let` instead of `var`
- Prefer arrow functions for shorter syntax
- Use template literals for string interpolation
- Error handling with try/catch where appropriate

### Discord Bot Specific
- All slash commands must have descriptions with emojis (as per project specification)
- Admin-only commands must have proper permission checks
- Commands should be auto-loaded from `src/commands/` directory
- Follow the existing command structure in `src/commands/`

### Web Server
- All web routes must include security headers
- Rate limiting must be applied to API endpoints
- No sensitive data in logs or error messages
- CORS considerations for public deployment

## License

By contributing to OpenBot, you agree that your contributions will be licensed under the MIT License.

## Versioning

This project follows Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Incompatible API changes
- **MINOR**: Added functionality in a backwards-compatible manner
- **PATCH**: Backwards-compatible bug fixes

## Reporting Security Issues

### Do NOT disclose security vulnerabilities publicly

Instead, report them privately via email to:
- hippolyte@zorcraft.ovh (or open an issue marked as `security` if public)

### What to Include
- Type of vulnerability (XSS, injection, auth bypass, etc.)
- Steps to reproduce
- Potential impact
- Screenshots/videos if applicable
- Your environment (OS, Discord client version, etc.)

### Responsible Disclosure
- Project maintainers will acknowledge the report within 48 hours
- A fix will be prioritized and released in a timely manner
- Credit will be given (unless you prefer to remain anonymous)

## Frequently Asked Questions

### How do I run the bot locally?
```bash
git clone https://github.com/Hippolyte59/openbot.git
cd openbot
pnpm install
cp .env.example .env  # Fill in your Discord token and client ID
pnpm run build
pnpm run dev
```

### How do I deploy commands?
```bash
pnpm run deploy
```

### How do I contribute a new command?
1. Create a new file in `src/commands/` following the existing pattern
2. Add the command to the appropriate category in `src/data/categories.ts`
3. Update the wiki if needed
4. Follow the workflow above to submit your PR

## Need Help?

- Open an issue for bug reports or feature requests
- Discuss ideas in Discussions (if enabled)
- Contact the maintainers via GitHub

---

**Thank you for contributing to OpenBot!** 