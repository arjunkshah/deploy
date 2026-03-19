# Contributing

Thanks for helping improve Deploy.com. This guide covers setup, workflow, and quality checks.

## Development setup
1. Install dependencies
   - `npm install`
2. Copy environment variables
   - `cp .env.local.example .env.local`
3. Start the dev server
   - `npm run dev`

## Local checks
- Lint: `npm run lint`
- Build: `npm run build`
- Tests: `npm run test`
- Load test (optional): `npm run loadtest`

## Pull request guidelines
- Keep PRs focused and small.
- Include tests for behavior changes.
- Update docs when you change APIs or workflows.
- Avoid breaking changes unless discussed.

## Style
- Use existing components and patterns.
- Prefer Tailwind utilities to custom CSS.
- Keep types strict and avoid `any`.

## Reporting issues
Use the GitHub issue templates and include:
- Steps to reproduce
- Expected vs actual behavior
- Logs and screenshots
