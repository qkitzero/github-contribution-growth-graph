# Contributing to GitHub Contribution Growth Graph

Thank you for your interest in contributing! This guide will help you get started.

## Development Environment Setup

### Prerequisites

- [Node.js 24](https://nodejs.org/)
- [Docker](https://www.docker.com/) and Docker Compose
- A [GitHub personal access token](https://github.com/settings/tokens) with `read:user` scope

### Getting Started

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/<your-username>/github-contribution-growth-graph.git
   cd github-contribution-growth-graph
   ```

2. Copy the environment file and fill in required values:

   ```bash
   cp .env.example .env
   ```

   At minimum, set `GITHUB_TOKEN` to your GitHub personal access token.

3. Configure npm for private packages:

   This project uses `@qkitzero` scoped packages from GitHub Packages. Create or update your `~/.npmrc`:

   ```
   @qkitzero:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
   ```

   Your token needs the `read:packages` scope.

4. Install dependencies:

   ```bash
   npm ci
   ```

5. Start the development environment:

   **With Docker Compose** (full stack — requires sibling repos `../auth-service` and `../logging-service`):

   ```bash
   docker compose up
   ```

   **Without Docker** (app server only):

   ```bash
   npm run dev
   ```

6. Build for production:

   ```bash
   npm run build
   ```

## Branch Strategy

This project uses a three-tier branching model:

```
feature/<issue-number> → develop → main
```

| Branch                  | Purpose                                   |
| ----------------------- | ----------------------------------------- |
| `main`                  | Production branch. Always stable.         |
| `develop`               | Integration branch. Features merge here.  |
| `feature/<issue-number>`| Feature branches. Named by issue number.  |

When starting work, branch from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/<issue-number>
```

## Coding Standards

### Architecture

The project follows Clean Architecture with four layers:

```
src/
├── interface/        # Controllers, routes, middleware
├── application/      # Use cases, service interfaces
├── domain/           # Entities and value objects
└── infrastructure/   # External service implementations
```

Dependencies flow inward: `interface/` → `application/` → `domain/`. `infrastructure/` implements interfaces defined in `application/`.

### ESLint

```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
```

Key rules:
- `@typescript-eslint/no-floating-promises: error` — all Promises must be handled
- `@typescript-eslint/no-unused-vars: error` — prefix unused variables with `_`
- `@typescript-eslint/no-explicit-any: warn`

### Prettier

```bash
npm run format
```

Configuration: single quotes, semicolons, trailing commas, 100-character line width, 2-space indentation. Imports are auto-sorted via `prettier-plugin-organize-imports`.

## Running Tests

```bash
npm test              # Run all tests
npm run test:cov      # Run tests with coverage report
npm run coverage:open # Open HTML coverage report
```

- Test framework: Jest with `ts-jest`
- Test files live alongside source files with a `.test.ts` suffix
- Coverage is collected from all `src/**/*.ts` files (excluding `server.ts` and `.d.ts`)
- CI runs both lint and tests on every push and PR to `main` and `develop`

All tests must pass and existing coverage must not decrease before a PR can be merged.

## Pull Request Process

1. **Create or find an issue** describing the change.
2. **Branch from `develop`** using `feature/<issue-number>`.
3. **Make your changes**, following the coding standards above.
4. **Run lint and tests locally** before pushing:
   ```bash
   npm run lint
   npm test
   ```
5. **Push and open a PR** targeting `develop`.
6. **CI checks must pass** — the Test and Lint workflows run automatically.
7. **Code review** — a maintainer will review your PR.
8. **Merge** — after approval, your PR will be merged into `develop`.

### PR Guidelines

- Keep PRs focused on a single issue
- Reference the issue number in commits (e.g., `#162`)
- Add tests for new functionality
- Follow the existing architecture layer boundaries

## How to Report Issues

Use [GitHub Issues](https://github.com/qkitzero/github-contribution-growth-graph/issues) to report bugs or request features.

**For bugs**, include:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS)

**For feature requests**, describe:
- The use case
- A proposed solution

## Commit Message Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
type: description (#issue-number)
```

### Types

| Type           | Description              |
| -------------- | ------------------------ |
| `feat`         | New feature              |
| `fix`          | Bug fix                  |
| `docs`         | Documentation            |
| `test`         | Adding or updating tests |
| `perf`         | Performance improvement  |
| `build(deps)`  | Dependency update        |
| `chore`        | Maintenance task         |

### Rules

- Use imperative mood (e.g., "add", "fix", not "added", "fixed")
- Reference the issue number at the end in parentheses
- Keep the subject line concise

### Examples

```
feat: add rate limiting using express-rate-limit (#134)
fix: use npm ci instead of npm install in Dockerfile (#142)
docs: add MIT License (#155)
test: add coverage for logging failure catch handlers (#145)
```
