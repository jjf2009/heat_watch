<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`, `npm run build`

## Commit Attribution
AI commits MUST include:
```text
Co-Authored-By: Antigravity <noreply@google.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint path/to/file.ts` |

## Project Documentation
Detailed input/output mappings for every file are available in `README.md`.
For high-level agent overviews, see `llms.txt`.
